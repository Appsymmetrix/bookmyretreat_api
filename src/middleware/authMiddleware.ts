import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in the environment variables');
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): Response | void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};
