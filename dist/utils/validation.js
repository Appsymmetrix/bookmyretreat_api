"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactValidationSchema = exports.blogValidationSchema = exports.organizerValidation = exports.subscriptionValidator = exports.bookingValidationSchema = exports.reviewSchema = exports.filterSchema = exports.categorySchema = exports.retreatSchema = exports.userValidationPartial = exports.loginValidation = exports.userValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const userValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(30).required(),
        email: joi_1.default.string()
            .email({ tlds: { allow: ["com", "org", "net"] } })
            .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
            .required()
            .messages({
            "string.email": "Please provide a valid email address.",
            "string.pattern.base": "Email format is invalid. Please check again.",
        }),
        password: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string()
            .min(6)
            .required()
            .valid(joi_1.default.ref("password"))
            .messages({
            "any.only": "Passwords must match",
            "string.min": "Confirm password must be at least 6 characters",
        }),
        mobileNumber: joi_1.default.string().min(10).max(15).required(),
        city: joi_1.default.string().required(),
        role: joi_1.default.string().valid("user", "admin", "organiser").optional(),
        isEmailVerified: joi_1.default.boolean().optional(),
    });
    return schema.validate(data);
};
exports.userValidation = userValidation;
const loginValidation = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),
        password: joi_1.default.string().min(6).required().messages({
            "string.min": "Password must be at least 6 characters",
            "any.required": "Password is required",
        }),
    });
    return schema.validate(data);
};
exports.loginValidation = loginValidation;
const userValidationPartial = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(30).required(),
        email: joi_1.default.string().email().required(),
        mobileNumber: joi_1.default.string().min(10).max(15).required(),
        city: joi_1.default.string().required(),
        countryCode: joi_1.default.string().optional(),
        role: joi_1.default.string().valid("user", "admin", "organiser").optional(),
    });
    return schema.validate(data);
};
exports.userValidationPartial = userValidationPartial;
exports.retreatSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    price: joi_1.default.number().required(),
    organizerName: joi_1.default.string().required(),
    organizerContact: joi_1.default.string().required(),
    retreatMonths: joi_1.default.string().optional().allow(""),
    organizerId: joi_1.default.string().hex().length(24).allow(null),
    daysOfRetreat: joi_1.default.string().required(),
    rooms: joi_1.default.array()
        .items(joi_1.default.object({
        type: joi_1.default.string().required(),
        numberOfRooms: joi_1.default.number().required(),
        peopleAllowed: joi_1.default.number().required(),
        roomPrice: joi_1.default.number().required(),
        imageUrls: joi_1.default.array().items(joi_1.default.string()).required(),
    }))
        .required(),
    teachers: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        image: joi_1.default.string().optional().allow(null, ""),
    })),
    foodDetails: joi_1.default.array()
        .items(joi_1.default.object({
        mealName: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
    }))
        .optional(),
    city: joi_1.default.string().required(),
    state: joi_1.default.string().required(),
    country: joi_1.default.string().required(),
    fullAddress: joi_1.default.string().required(),
    googleMapUrl: joi_1.default.string(),
    geoLocation: joi_1.default.object({
        type: joi_1.default.string().valid("Point").required(),
        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2).required(),
    }).required(),
    imageUrls: joi_1.default.array().items(joi_1.default.string().uri()).required(),
    features: joi_1.default.string().required(),
    benefits: joi_1.default.string().required(),
    programs: joi_1.default.string().required(),
    customSection: joi_1.default.string().required(),
    includedInPackage: joi_1.default.string().required(),
    includedInPrice: joi_1.default.string().required(),
    availability: joi_1.default.object({
        startDate: joi_1.default.date().required(),
        endDate: joi_1.default.date().required(),
    }).required(),
    category: joi_1.default.string().hex().length(24).required(),
    popular: joi_1.default.array().items(joi_1.default.object({
        id: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
    })),
    isWishlisted: joi_1.default.boolean(),
    isApproved: joi_1.default.boolean().optional(),
    isCreatedByAdmin: joi_1.default.boolean().optional(),
});
exports.categorySchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    imgUrl: joi_1.default.array().items(joi_1.default.string().uri()).required(),
});
exports.filterSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).required().messages({
        "string.empty": "Filter name is required",
        "string.min": "Filter name should have a minimum length of 3",
        "string.max": "Filter name should have a maximum length of 50",
    }),
});
const reviewDetailsSchema = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).required(),
    comment: joi_1.default.string().required(),
});
exports.reviewSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    retreatId: joi_1.default.string().required(),
    reviews: joi_1.default.array().items(reviewDetailsSchema).required(),
});
exports.bookingValidationSchema = joi_1.default.object({
    retreatId: joi_1.default.string().hex().length(24).required().label("Retreat ID"),
    userId: joi_1.default.string().hex().length(24).required().label("User ID"),
    dates: joi_1.default.object({
        start: joi_1.default.date().required().label("Start date"),
        end: joi_1.default.date().required().label("End date"),
    })
        .required()
        .label("Dates"),
    numberOfPeople: joi_1.default.number()
        .integer()
        .min(1)
        .required()
        .label("Number of People"),
    personName: joi_1.default.string().min(2).max(50).required().label("Person Name"),
    accommodation: joi_1.default.object({
        type: joi_1.default.string().required().label("Accommodation Type"),
        numberOfRooms: joi_1.default.number()
            .integer()
            .min(1)
            .required()
            .label("Number of Rooms"),
        peopleAllowed: joi_1.default.number()
            .integer()
            .min(1)
            .required()
            .label("People Allowed"),
        roomPrice: joi_1.default.number().min(0).required().label("Room Price"),
        imageUrls: joi_1.default.array()
            .items(joi_1.default.string().uri())
            .min(1)
            .required()
            .label("Image URLs"),
    })
        .required()
        .label("Accommodation"),
    totalAmount: joi_1.default.number().min(0).required().label("Total Amount"),
    status: joi_1.default.string()
        .valid("pending", "upcoming", "cancelled", "completed", "confirmed")
        .default("pending")
        .label("Status"),
});
exports.subscriptionValidator = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please provide a valid email address.",
        "string.empty": "Email cannot be empty.",
        "any.required": "Email is required.",
    }),
});
const organizerValidation = (data) => {
    const schema = joi_1.default.object({
        role: joi_1.default.string().valid("organiser").required().messages({
            "any.only": "Role must be 'organiser'",
            "any.required": "Role is required",
        }),
        organizationName: joi_1.default.string().min(3).max(100).required().messages({
            "string.empty": "Organization name is required",
            "string.min": "Organization name must be at least 3 characters",
            "string.max": "Organization name must be less than 100 characters",
        }),
        email: joi_1.default.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
        }),
        mobileNumber: joi_1.default.string()
            .pattern(/^[0-9]{10,15}$/)
            .required()
            .messages({
            "string.empty": "Mobile number is required",
            "string.pattern.base": "Mobile number must be between 10 and 15 digits",
        }),
        password: joi_1.default.string().min(8).required().messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
        }),
        confirmPassword: joi_1.default.any().valid(joi_1.default.ref("password")).required().messages({
            "any.only": "Confirm password must match the password",
            "any.required": "Confirm password is required",
        }),
        description: joi_1.default.string().max(500).optional().allow("").messages({
            "string.max": "Description must be less than 500 characters",
        }),
        imageUrl: joi_1.default.string().uri().optional().allow("").messages({
            "string.uri": "Image URL must be a valid URI",
        }),
    });
    return schema.validate(data, { abortEarly: false });
};
exports.organizerValidation = organizerValidation;
exports.blogValidationSchema = joi_1.default.object({
    title: joi_1.default.string().required().trim(),
    desc: joi_1.default.string().required(),
    imageTileUrl: joi_1.default.string().uri().required(),
    slug: joi_1.default.string().required().trim().lowercase(),
    readTime: joi_1.default.number().required(),
    content: joi_1.default.string().required(),
    category: joi_1.default.string().hex().length(24).required(),
    keywords: joi_1.default.array().items(joi_1.default.string().trim()).optional(),
});
exports.contactValidationSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        "string.base": "Name must be a string",
        "any.required": "Name is required",
    }),
    mobileNumber: joi_1.default.string().required().length(10).messages({
        "string.base": "Mobile number must be a string",
        "string.length": "Mobile number must be exactly 10 digits",
        "any.required": "Mobile number is required",
    }),
    category: joi_1.default.string().required().messages({
        "string.base": "Category must be a string",
        "any.required": "Category is required",
    }),
});
