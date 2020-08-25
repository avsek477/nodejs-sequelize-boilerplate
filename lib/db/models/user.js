'use strict';
const {
  Model
} = require('sequelize');
const hasher = require("../../auth/hasher");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordSalt: {
      type: DataTypes.STRING,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    timestamps: true,
    modelName: 'User',
    indexes: [{unique: true, fields: ['id']}],
  });
  
  User.beforeCreate(async (user) => {
    if(user.password) {
      const saltPassword = await hasher.createSalt();
      const hashedPassword = await hasher.computeHash(user.password, saltPassword);
      user.password = hashedPassword;
      user.passwordSalt = saltPassword;
    }
  });
  
  return User;
};