const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
      logging: console.log,
    },
);

// const dbService = () => {
const authenticateDB = () => sequelize.authenticate();

const dropDB = () => sequelize.drop();

const syncDB = () => sequelize.sync();

const successfulDBStart = () => (
  console.info('connection to the sequelize has been established successfully')
);

const errorDBStart = (err) => (
  console.info('unable to connect to the sequelize:', err)
);

const wrongEnvironment = () => {
  console.warn(`only development, staging, test and production are valid NODE_ENV variables but ${process.env.NODE_ENV} is specified`);
  return process.exit(1);
};

const startMigrateTrue = async () => {
  try {
    await syncDB();
    successfulDBStart();
  } catch (err) {
    errorDBStart(err);
  }
};

const startMigrateFalse = async () => {
  try {
    await dropDB();
    await syncDB();
    successfulDBStart();
  } catch (err) {
    errorDBStart(err);
  }
};

const startEnvironment = async () => {
  try {
    await authenticateDB();
    if (JSON.parse(process.env.DB_MIGRATE_STATUS)) {
      return startMigrateTrue();
    }
    return startMigrateFalse();
  } catch (err) {
    return errorDBStart(err);
  }
};

const start = async (app) => {
  app.locals.sequelize = sequelize;
  if (!['development', 'staging', 'testing', 'production'].includes(process.env.NODE_ENV)) {
    await wrongEnvironment();
  } else {
    await startEnvironment();
  }
};
// }

module.exports = {
  start,
  sequelize,
};
