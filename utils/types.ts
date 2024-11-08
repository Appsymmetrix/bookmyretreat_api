import { Request, Response, NextFunction } from "express";

export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
}

export const generateOrderId = () => {
  const prefix = "ORD"; // Prefix for the order ID
  const middleText = "RETREAT"; // Custom text in the middle
  const timestamp = Date.now().toString(); // Current timestamp in milliseconds
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${prefix}-${timestamp}-${middleText}-${randomNumber}`;
};

