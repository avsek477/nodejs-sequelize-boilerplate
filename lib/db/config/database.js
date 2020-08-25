require('dotenv').config();

module.exports = {
  "development": {
    "use_env_variable": "PRODUCTION_DB_URL",
    "dialect": "postgres",
    "logging": true
  },
  "test": {
    "username": "postgres",
    "password": "postgres",
    "database": "ideahub",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "PRODUCTION_DB_URL",
    "dialect": "postgres",
    "logging": false
  }
}
