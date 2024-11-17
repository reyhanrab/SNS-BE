import Joi from 'joi';

// Validation schema for signup
export const signupValidation = Joi.object({
  data: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('donor', 'volunteer').required(),
  }).required(),
});

// Validation schema for login
export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Validation schema for forgotPassword
export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

// Validation schema for resetPassword
export const resetPasswordValidation = Joi.object({
  password: Joi.string().min(8).required(),
  code: Joi.string().length(6).required(),
});

// Validation schema for resendCode
export const resendCodeValidation = Joi.object({
  email: Joi.string().email().required(),
});

// Validation schema for resetPasswordWhenLoggedIn
export const resetPasswordWhenLoggedInValidation = Joi.object({
  password: Joi.string().min(8).required(),
});
