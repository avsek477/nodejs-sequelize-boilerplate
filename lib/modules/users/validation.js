const Joi = require('@hapi/joi');
const schemaValidator = require("../../helpers/validator-error");
const moduleConfig = require("./config");

const createUserSchema = async (req, res, next) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'io']}}).lowercase().required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required().strict(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict(),
      countryCode: Joi.string(),
      mobileNumber: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/),
      birthday: Joi.date().max('1-1-2004').iso(),
    }).with('password', 'confirmPassword');
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if(error) return schemaValidator(res, error);
    return value;
  } catch (err) {
    return next(err);
  }
};

const getUserByIdSchema = async (req, res, next) => {
  try {
    const schema = Joi.object({
      userId: Joi.number().integer().min(1).required(),
    });
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    if(error) return schemaValidator(res, error);
    return value;
  } catch (err) {
    return next(err);
  }
};

const updateUserSchema = async (req, res, next) => {
  try {
    const schema = Joi.object({
      params: Joi.object({
        userId: Joi.number().integer().min(1).required()
      }),
      body: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email({minDomainSegments: 2, tlds: {allow: ['com', 'net', 'io']}}).lowercase().required(),
        countryCode: Joi.string(),
        mobileNumber: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/),
        birthday: Joi.date().max('1-1-2004').iso()
      })
    }).unknown(true);
    const { error, value } = schema.validate(req, { abortEarly: false });
    if(error) return schemaValidator(res, error);
    return value;
  } catch(err) {
    return next(err);
  }
}

module.exports = {
  createUserSchema,
  getUserByIdSchema,
  updateUserSchema
};
