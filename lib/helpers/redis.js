((redisHelper) => {
  'use strict';

  const redis = require('redis');
  const client = redis.createClient(+process.env.REDIS_PORT, process.env.REDIS_HOST, {no_ready_check: true});
  const commonHelper = require('../common/common-helper-function');
  const HTTPStatus = require('http-status');
  const Promise = require('bluebird');
  const Redlock = require('redlock');

  redisHelper.init = (app) => {
    client.auth(process.env.REDIS_PASSWORD, (err) => {
      if (err) throw err;
    });

    client.on('ready', () => {
      console.log('Ready to connect to Redis database...');
    });

    client.on('connect', () => {
      console.log('Connected to Redis database...');
      app.locals.redis_cache_db = client;
    });

    client.on('error', (err) => {
      console.log('Error ' + err);
    });
  };

  redisHelper.getClient = () => client;

  redisHelper.generateUniqueCacheKey = (req) => `${req.baseUrl}${req.url}`;

  redisHelper.getCachedObjectData = (req, res, next) => {
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    req.redis_cache_db.get(_keyData, (err, data) => {
      if (!err && data !== null) {
        return commonHelper.sendJsonResponse(res, JSON.parse(data), '', HTTPStatus.OK);
      }
      next();
    });
  };

  redisHelper.getCachedStringData = (req, res, next) => {
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    req.redis_cache_db.get(_keyData, (err, data) => {
      if (!err && data !== null) {
        return commonHelper.sendJsonResponse(res, data, '', HTTPStatus.OK);
      }
      next();
    });
  };

  redisHelper.setDataForCatch = (req, key, data) => {
    const storeData = (typeof data === 'string') ? data : JSON.stringify(data);
    req.redis_cache_db.setex(key, (parseInt(process.env.REDIS_CACHE_EXPIRES_IN) * 60 * 60), storeData);
  };

  redisHelper.getCachedForObjectData = (req, key) => new Promise((resolve, reject) => {
    req.redis_cache_db.get(key, (err, data) => {
      if (!err && data !== null) {
        resolve(JSON.parse(data));
      } else {
        reject(err);
      }
    });
  });

  redisHelper.setDataToCache = (req, data) => {
    const _keyData = redisHelper.generateUniqueCacheKey(req);
    const storeData = (typeof data === 'string') ? data : JSON.stringify(data);
    req.redis_cache_db.setex(_keyData, (parseInt(process.env.REDIS_CACHE_EXPIRES_IN) * 60 * 60), storeData);
  };

  redisHelper.scanRedisKeys = (req, cursor, returnKeys) => {
    req.redis_cache_db.scan(
        cursor,
        'MATCH', `${req.baseUrl}*`,
        'COUNT', '1',
        (err, res) => {
          if (!err) {
            cursor = res[0];
            const cacheKeys = res[1];
            cacheKeys.forEach((key) => {
              returnKeys.push(key);
            });
            if (cacheKeys.length > 0) {
              console.log('Array of matching keys', cacheKeys);
            }
            if (cursor === '0') {
              return redisHelper.clearCacheKeys(returnKeys);
            }
          } else {
            return Promise.resolve([]);
          }

          return redisHelper.scanRedisKeys(req, cursor, returnKeys);
        });
  };

  redisHelper.clearDataCache = async (req) => {
    // Delete cached model data
    const cursor = '0';
    const returnKeys = [];
    redisHelper.scanRedisKeys(req, cursor, returnKeys);
  };

  redisHelper.clearCacheKeys = (keys) => {
    client.del(keys, (err) => {
      if (!err) {
        console.log('keys cleared from the redis db...');
      }
      return;
    });
  };

  redisHelper.redLock = async (req, key, value) => {
    const redlock = new Redlock(
        [client],
        {
          // the expected clock drift for more details see http://redis.io/topics/distlock
          driftFactor: 0.01, // time in ms

          // the max number of times Redlock will attempt to lock a resource before erroring
          retryCount: 1,

          // the time in ms between attempts
          retryDelay: 200, // time in ms

          // the max time in ms randomly added to retries to improve performance under high contention
          // see https://www.awsarchitectureblog.com/2015/03/backoff.html
          retryJitter: 200, // time in ms
        },
    );

    const resource = 'locks:' + key + ':' + value;
    const ttl = 1000 * 60 * 2;
    return redlock.lock(resource, ttl);
  };
})(module.exports);
