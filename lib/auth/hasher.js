((hashOperator) => {
  'use strict';

  const crypto = require('crypto');
  const bcrypt = require('bcrypt');
  const Promise = require('bluebird');

  hashOperator.computeHash = (sourcePassword, salt) => {
    return new Promise(((resolve, reject) => {
      bcrypt.hash(sourcePassword, salt, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    }));
  };

  hashOperator.createSalt = () => {
    return new Promise(((resolve, reject) => {
      bcrypt.genSalt(+process.env.SALT_ROUNDS, (err, salt) => {
        if (!err) {
          resolve(salt);
        } else {
          reject(err);
        }
      });
    }));
  };

  hashOperator.comparePassword = (inputPwd, hash) => {
    return new Promise(((resolve, reject) => {
      bcrypt.compare(inputPwd, hash, (err, isMatch) => {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    }));
  };

  hashOperator.generateRandomBytes = (length) => {
    return new Promise(((resolve, reject) => {
      crypto.randomBytes(length, (err, saltBuffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(saltBuffer.toString('hex').substring(0, length));
        }
      });
    }));
  };
})(module.exports);
