import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

interface IUserPayload {
  user: IUser;
}

interface RequestWithUser extends Request {
  user?: Partial<IUser>;
}

export const verifyToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as IUserPayload;

    req.user = {
      id: decoded.user._id,
      name: decoded.user.name,
      email: decoded.user.email,
      mobileNumber: decoded.user.mobileNumber,
      city: decoded.user.city,
      countryCode: decoded.user.countryCode,
      role: decoded.user.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
    return;
  }
};

export const authorizeRole = (allowedRoles: Array<IUser["role"]>) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return; 
    }

    next();
  };
};
