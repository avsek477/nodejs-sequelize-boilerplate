'use strict';

const HTTPStatus = require('http-status');
const express = require('express');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const device = require('express-device');
const useragent = require('useragent');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const router = require('./lib/routes/index');
const commonHelper = require('./lib/common/common-helper-function');

require("express-async-errors");

const dotenv = require('dotenv').config({path: __dirname + '/.env'});
if (dotenv.error) {
  console.log('=---dotenv.error---=', dotenv.error);
  throw dotenv.error;
}

const redisHelper = require('./lib/helpers/redis');
// const dbHelper = require('./lib/helpers/sequelize');
const dbHelper = require('./lib/db/models/index');
const configureAppSecurity = require('./lib/config/security');

const app = express();
if (process.env.NODE_ENV === 'production') {
  const whitelist = [];
  const corsOptions = {
    origin(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };
  app.use(cors(corsOptions));
} else {
  const corsOptions = {
    origin: [`http://localhost:${process.env.PORT}`],
  };
  app.use(cors(corsOptions));
}

redisHelper.init(app);
// dbHelper.start(app);

app.use(device.capture());

app.set('rateLimit', 100);

app.use((req, res, next) => {
  req.env = process.env.NODE_ENV || 'development';
  if (app.locals.redis_cache_db) {
    req.redis_cache_db = app.locals.redis_cache_db;
  }
  req.root_dir = __dirname;
  global.root_dir = __dirname;
  req.client_ip_address = requestIp.getClientIp(req);
  req.client_device = req.device.type + ' ' + req.device.name;
  next();
});

app.set('root_dir', __dirname);
useragent(true);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
  res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Authorization,x-access-token,Accept',
  );
  // Set cache control header to eliminate cookies from cache
  res.setHeader('Cache-Control', 'no-cache="Set-Cookie, Set-Cookie2"');
  next();
});

const redisStoreOpts = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  client: redisHelper.getClient(),
  ttl: (20 * 60), // TTL of 20 minutes represented in seconds
  db: process.env.REDIS_DB,
  pass: process.env.REDIS_PASSWORD,
};

app.use(bodyParser.urlencoded({extended: true}));
// create application/json parser
app.use(bodyParser.json());

const sessionOpts = {
  store: new RedisStore(redisStoreOpts),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  maxAge: 1200000, // 20 minutes
  cookie: {
    // domain: 'secure.example.com' // limit the cookie exposure
    secure: true, // set the cookie only to be served with HTTPS
    path: '/',
    httpOnly: true, // Mitigate XSS
    maxAge: null,
  },
};

app.use(session(sessionOpts));

configureAppSecurity.init(app);

router.init(app);

app.get('/', (req, res) => {
  res.send('Nodejs Boilerplate...');
});

app.use((err, req, res, next) => {
  console.log('global err', err);
  if (!res.headersSent) {
    return commonHelper.sendResponseData(res, {
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: app.get('env') === 'development' ? err.message : 'INTERNAL SERVER ERROR',
    });
  }
});

module.exports = app;
