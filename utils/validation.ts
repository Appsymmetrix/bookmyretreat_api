import Joi from "joi";

export const userValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .min(6)
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Passwords must match",
        "string.min": "Confirm password must be at least 6 characters",
      }),
    mobileNumber: Joi.string().min(10).max(15).required(),
    city: Joi.string().required(),
    countryCode: Joi.string().required(),
    role: Joi.string().valid("user", "admin", "organiser").optional(),
  });

  return schema.validate(data);
};

export const loginValidation = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
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
    role: Joi.string().valid("user", "admin", "organiser").optional(),
  });

  return schema.validate(data);
};

export const retreatValidationPartial = (data: any) => {
  const locationSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).required(),
  });

  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(5).required(),
    price: Joi.number().positive().required(),
    locations: locationSchema.required(),
    features: Joi.string().required(),
    availability: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
    }).required(),
    imageUrls: Joi.array().items(Joi.string().uri()).required(),
    category: Joi.array()
      .items(
        Joi.object({
          id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(), // MongoDB ObjectId validation
          name: Joi.string().required(), // Name field is required
        })
      )
      .optional(),

    popular: Joi.array()
      .items(
        Joi.object({
          id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(), // MongoDB ObjectId validation
          name: Joi.string().required(), // Name field is required
        })
      )
      .optional(),

    isShortlist: Joi.boolean(),
  });

  return schema.validate(data, { abortEarly: false });
};
export const categorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name should have a minimum length of 3",
    "string.max": "Category name should have a maximum length of 50",
  }),
});

export const filterSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Filter name is required",
    "string.min": "Filter name should have a minimum length of 3",
    "string.max": "Filter name should have a maximum length of 50",
  }),
});

const reviewDetailsSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
});

export const reviewSchema = Joi.object({
  userId: Joi.string().required(),
  reviews: Joi.array().items(reviewDetailsSchema).required(),
});

export const bookingValidationSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().label("User ID"),
  dates: Joi.object({
    start: Joi.date().required().label("Start date"),
    end: Joi.date().required().label("End date"),
  }).required(),
  numberOfPeople: Joi.number()
    .integer()
    .min(1)
    .required()
    .label("Number of People"),
  personName: Joi.string().min(2).max(50).required().label("Person Name"),
  accommodation: Joi.string().required().label("Accommodation"),
  totalAmount: Joi.number().min(0).required().label("Total Amount"),
});

export const subscriptionValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
  }),
});
