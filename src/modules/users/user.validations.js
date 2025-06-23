import Joi from 'joi';

export const passwordReg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
export const contactReg = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export default {
  signup: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .regex(passwordReg)
        .required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phone: Joi.string()
        .regex(contactReg).optional()
    },
  }
};
