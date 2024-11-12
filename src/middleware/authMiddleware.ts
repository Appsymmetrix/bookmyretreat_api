import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../models/User";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: Partial<IUser>;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["admin-token"] as string;

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as any;

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

    return next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const authorizeRole = (allowedRoles: IUser["role"][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    return next();
  };
};
