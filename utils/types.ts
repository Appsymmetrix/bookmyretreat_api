import { Request, Response, NextFunction } from "express";

export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric code
}

export const generateOrderId = () => {
  const randomAlpha = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4-character random alphanumeric string
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  const suffix = Math.floor(100 + Math.random() * 900); // 3-digit random number
  return `${randomAlpha}${randomNumber}${suffix}`; // Concatenate all parts
};
