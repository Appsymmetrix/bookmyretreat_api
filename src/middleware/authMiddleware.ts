import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in the environment variables"
  );
}
interface IUserPayload {
  user?: IUser;
}

interface RequestWithUser extends Request {
  user?: IUserPayload;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as IUserPayload;

    (req as RequestWithUser).user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

export const authorizeRole = (allowedRoles: Array<IUser["role"]>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as IUserPayload;

      if (!allowedRoles.includes(decoded?.user?.role)) {
        res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ message: "Forbidden: Invalid token" });
    }
  };
};
