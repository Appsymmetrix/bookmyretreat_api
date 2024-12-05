import Joi from "joi";

export const userValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string()
      .email({ tlds: { allow: ["com", "org", "net"] } })
      .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
      .required()
      .messages({
        "string.email": "Please provide a valid email address.",
        "string.pattern.base": "Email format is invalid. Please check again.",
      }),
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
    role: Joi.string().valid("user", "admin", "organiser").optional(),
    isEmailVerified: Joi.boolean().optional(),
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
    countryCode: Joi.string().optional(),
    role: Joi.string().valid("user", "admin", "organiser").optional(),
  });

  return schema.validate(data);
};

export const retreatSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  organizerName: Joi.string().required(),
  organizerContact: Joi.string().required(),
  retreatMonths: Joi.string().required(),
  organizerId: Joi.string().required(),
  daysOfRetreat: Joi.string().required(),
  rooms: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required(),
        numberOfRooms: Joi.number().required(),
        peopleAllowed: Joi.number().required(),
        roomPrice: Joi.number().required(),
      })
    )
    .required(),
  teachers: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().optional().allow(null, ""), // Make image optional
    })
  ),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  fullAddress: Joi.string().required(),
  googleMapUrl: Joi.string(),
  geoLocation: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
  imageUrls: Joi.array().items(Joi.string().uri()).required(),
  features: Joi.string().required(),
  benefits: Joi.string().required(),
  programs: Joi.string().required(),
  customSection: Joi.string().required(),
  includedInPackage: Joi.string().required(),
  includedInPrice: Joi.string().required(),
  availability: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }).required(),
  category: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
    })
  ),
  popular: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
    })
  ),
  isWishlisted: Joi.boolean(),
  isApproved: Joi.boolean(),
});

export const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  imgUrl: Joi.array().items(Joi.string().uri()).required(),
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
  retreatId: Joi.string().required(),
  reviews: Joi.array().items(reviewDetailsSchema).required(),
});

export const bookingValidationSchema = Joi.object({
  retreatId: Joi.string().hex().length(24).required().label("Retreat ID"),
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
  status: Joi.string()
    .valid("pending", "upcoming", "cancelled", "completed", "confirmed")
    .default("pending")
    .label("Status"),
});

export const subscriptionValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
  }),
});

export const organizerValidation = (data: any) => {
  const schema = Joi.object({
    role: Joi.string().valid("organiser").required().messages({
      "any.only": "Role must be 'organiser'",
      "any.required": "Role is required",
    }),

    organizationName: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Organization name is required",
      "string.min": "Organization name must be at least 3 characters",
      "string.max": "Organization name must be less than 100 characters",
    }),

    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address",
    }),

    mobileNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        "string.empty": "Mobile number is required",
        "string.pattern.base": "Mobile number must be between 10 and 15 digits",
      }),

    password: Joi.string().min(8).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
    }),

    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "Confirm password must match the password",
      "any.required": "Confirm password is required",
    }),

    description: Joi.string().max(500).optional().allow("").messages({
      "string.max": "Description must be less than 500 characters",
    }),

    imageUrl: Joi.string().uri().optional().allow("").messages({
      "string.uri": "Image URL must be a valid URI",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

export const blogValidationSchema = Joi.object({
  title: Joi.string().required().trim(),
  desc: Joi.string().required(),
  imageTileUrl: Joi.string().uri().required(),
  slug: Joi.string().required().trim().lowercase(),
  readTime: Joi.number().required(),
  content: Joi.string().required(),
  category: Joi.string().hex().length(24).required(),
  keywords: Joi.array().items(Joi.string().trim()).optional(),
});

export const contactValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  mobileNumber: Joi.string().required().length(10).messages({
    "string.base": "Mobile number must be a string",
    "string.length": "Mobile number must be exactly 10 digits",
    "any.required": "Mobile number is required",
  }),
  category: Joi.string().required().messages({
    "string.base": "Category must be a string",
    "any.required": "Category is required",
  }),
});
