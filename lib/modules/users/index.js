(() => {
  'use strict';

  module.exports = {
    createUser: require('./methods/create-user'),
    getAllUsers: require('./methods/get-all-users'),
    getUserById: require("./methods/get-user-by-id"),
    updateUserById: require("./methods/update-user")
  };
})();
