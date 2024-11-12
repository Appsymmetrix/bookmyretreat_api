"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderId = void 0;
exports.generateResetCode = generateResetCode;
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
}
const generateOrderId = () => {
    const prefix = "ORD"; // Prefix for the order ID
    const middleText = "RETREAT"; // Custom text in the middle
    const timestamp = Date.now().toString(); // Current timestamp in milliseconds
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `${prefix}-${timestamp}-${middleText}-${randomNumber}`;
};
exports.generateOrderId = generateOrderId;
