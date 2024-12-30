import Joi from 'joi';

export interface IUserLoginDto {
  email: string;
  password: string;
}

export interface IUserSignupDto {
  email: string;
  password: string;
}

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
