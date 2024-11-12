"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyToken = (req, res, next) => {
    const token = req.headers["admin-token"];
    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded.id) {
            throw new Error("Token does not contain 'id' property");
        }
        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            mobileNumber: decoded.mobileNumber,
            city: decoded.city,
            countryCode: decoded.countryCode,
            role: decoded.role,
            iat: decoded.iat,
            exp: decoded.exp,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};
exports.verifyToken = verifyToken;
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        console.log(userRole, "userole");
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
