(() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const { createUserSchema } = require('../validation');
  const model = require('../../../db/models');
  const commonHelper = require('../../../common/common-helper-function');
  const moduleConfig = require('../config');

  module.exports = async (req, res, next) => {
    try {
      const result = await createUserSchema(req, res, next);
      const newUser = model.User.build(result);
      await newUser.save();
      return commonHelper.sendResponseData(res, {
        status: HTTPStatus.OK,
        data: newUser,
        message: moduleConfig.message.userSaved
      });
    } catch (err) {
      return commonHelper.sendCaughtError(res, err, next);
    }
  };
})();
