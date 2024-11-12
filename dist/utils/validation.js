"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionValidator = exports.bookingValidationSchema = exports.reviewSchema = exports.filterSchema = exports.categorySchema = exports.retreatValidationPartial = exports.userValidationPartial = exports.loginValidation = exports.userValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const userValidation = (data) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(30).required(),
        email: joi_1.default.string().email().required(),
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
        countryCode: joi_1.default.string().required(),
        role: joi_1.default.string().valid("user", "admin", "organiser").optional(),
        imageUrl: joi_1.default.string().uri().optional(),
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
        countryCode: joi_1.default.string().required(),
        role: joi_1.default.string().valid("user", "admin", "organiser").optional(),
    });
    return schema.validate(data);
};
exports.userValidationPartial = userValidationPartial;
const retreatValidationPartial = (data) => {
    const locationSchema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().optional(),
        coordinates: joi_1.default.object({
            lat: joi_1.default.number().required(),
            lng: joi_1.default.number().required(),
        }).required(),
    });
    const schema = joi_1.default.object({
        title: joi_1.default.string().min(3).max(100).required(),
        description: joi_1.default.string().min(5).required(),
        price: joi_1.default.number().positive().required(),
        locations: locationSchema.required(),
        features: joi_1.default.string().required(),
        benefits: joi_1.default.string().required(),
        programs: joi_1.default.string().required(),
        includedInPackage: joi_1.default.string().required(),
        includedInPrice: joi_1.default.string().required(),
        availability: joi_1.default.object({
            startDate: joi_1.default.date().required(),
            endDate: joi_1.default.date().required(),
        }).required(),
        imageUrls: joi_1.default.array().items(joi_1.default.string().uri()).required(),
        category: joi_1.default.array()
            .items(joi_1.default.object({
            id: joi_1.default.string()
                .regex(/^[0-9a-fA-F]{24}$/)
                .required(),
            name: joi_1.default.string().required(),
        }))
            .optional(),
        popular: joi_1.default.array()
            .items(joi_1.default.object({
            id: joi_1.default.string()
                .regex(/^[0-9a-fA-F]{24}$/)
                .required(),
            name: joi_1.default.string().required(),
        }))
            .optional(),
        isShortlist: joi_1.default.boolean(),
    });
    return schema.validate(data, { abortEarly: false });
};
exports.retreatValidationPartial = retreatValidationPartial;
exports.categorySchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).required().messages({
        "string.empty": "Category name is required",
        "string.min": "Category name should have a minimum length of 3",
        "string.max": "Category name should have a maximum length of 50",
    }),
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
    reviews: joi_1.default.array().items(reviewDetailsSchema).required(),
});
exports.bookingValidationSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required().label("User ID"),
    dates: joi_1.default.object({
        start: joi_1.default.date().required().label("Start date"),
        end: joi_1.default.date().required().label("End date"),
    }).required(),
    numberOfPeople: joi_1.default.number()
        .integer()
        .min(1)
        .required()
        .label("Number of People"),
    personName: joi_1.default.string().min(2).max(50).required().label("Person Name"),
    accommodation: joi_1.default.string().required().label("Accommodation"),
    totalAmount: joi_1.default.number().min(0).required().label("Total Amount"),
    status: joi_1.default.string()
        .valid("pending", "accepted", "denied")
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
