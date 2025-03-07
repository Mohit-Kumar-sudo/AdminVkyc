const Joi = require('@hapi/joi');

const passwordReg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
const contactReg = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordReg).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().pattern(contactReg).optional()
});

module.exports = {
  signupSchema
};
