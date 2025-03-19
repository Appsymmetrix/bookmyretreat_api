"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContact = void 0;
const Contact_1 = __importDefault(require("../models/Contact"));
const validation_1 = require("../../utils/validation");
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.contactValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const contact = new Contact_1.default(req.body);
        yield contact.save();
        return res.status(201).json({
            success: true,
            contact,
        });
    }
    catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
});
exports.createContact = createContact;
