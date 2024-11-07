import Joi from "joi";

export const userValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .min(6)
      .required()
      .valid(Joi.ref('password')) 
      .messages({
        'any.only': 'Passwords must match', 
        'string.min': 'Confirm password must be at least 6 characters', 
      }),
    mobileNumber: Joi.string().min(10).max(15).required(),
    city: Joi.string().required(),
    countryCode: Joi.string().required(),
    role: Joi.string().valid('user', 'admin', 'organiser').optional(), 
  });

  return schema.validate(data);
};


export const loginValidation = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
  });

  return schema.validate(data);
};

export const userValidationPartial = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.string().min(10).max(15).required(),
    city: Joi.string().required(),
    countryCode: Joi.string().required(),
    role: Joi.string().valid('user', 'admin', 'organiser').optional(), 
  });

  return schema.validate(data);
};