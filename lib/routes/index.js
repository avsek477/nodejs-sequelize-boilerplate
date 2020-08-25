((applicationRoutes) => {
  'use strict';

  applicationRoutes.init = (app) => {
    const HTTPStatus = require('http-status');
    const commonHelper = require('../common/common-helper-function');
    const rateLimiter = require('../middlewares/rate-limiter');

    rateLimiter.init(app);

    const userRouter = require('../modules/users/route');
    app.use('/api/user', userRouter);

    app.use('/api/*', (req, res, next) => {
      try {
        commonHelper.sendResponseData(res, {
          status: HTTPStatus.NOT_FOUND,
          message: 'Api Route not available',
        });
      } catch (err) {
        return next(err);
      }
    });
  };
})(module.exports);
