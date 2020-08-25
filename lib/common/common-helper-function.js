'use strict';

const geoip = require('geoip-lite');
const HTTPStatus = require("http-status");

const getGeoLocationInfo = (ipAddress) => {
  try {
    return geoip.lookup(ipAddress);
  } catch (err) {
    throw new Error(err);
  }
};

const sendResponseData = (res, {status, data, message}) => {
  res.status(status);
  return res.json({
    status,
    message,
    data,
  });
};

const sendUpdateResponseMessage = (res, dataRes, returnObj, messageResponse, notFoundResponse) => {
  const [ updated ] = dataRes;
  if (updated) {
    res.status(HTTPStatus.OK);
    res.json({
      'status': HTTPStatus.OK,
      'data': returnObj,
      'message': messageResponse
    });
  } else {
    res.status(HTTPStatus.NOT_FOUND);
    res.json({
      'status': HTTPStatus.NOT_FOUND,
      'message': notFoundResponse
    });
  }
};

const sendJsonResponseMessage = (res, dataRes, messageResponse, notFoundResponse) => {
  if (dataRes) {
    res.status(HTTPStatus.OK);
    res.json({
      'status': HTTPStatus.OK,
      'data': dataRes,
      'message': messageResponse
    });
  } else {
    res.status(HTTPStatus.NOT_FOUND);
    res.json({
      'status': HTTPStatus.NOT_FOUND,
      'message': notFoundResponse
    });
  }
};

const sendCaughtError = (res, err, next) => {
  try {
    if ( err instanceof Sequelize.ValidationError) {
      return schemaValidator(res, err, true);
    } else {
      return next(err);
    }
  } catch(err) {
    return next(err);
  }
}

module.exports = {
  getGeoLocationInfo,
  sendResponseData,
  sendUpdateResponseMessage,
  sendJsonResponseMessage,
  sendCaughtError
};
