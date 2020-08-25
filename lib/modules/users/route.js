const userRoutes = (() => {
  'use strict';

  const express = require('express');
  const userRouter = express.Router();
  const userController = require('./index');

  userRouter.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

  userRouter.route('/:userId')
    .get(userController.getUserById)
    .put(userController.updateUserById);

  return userRouter;
})();

module.exports = userRoutes;
