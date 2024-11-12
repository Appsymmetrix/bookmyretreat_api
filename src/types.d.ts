// src/types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
        mobileNumber: string;
        city: string;
        countryCode: string;
        iat: number;
        exp: number;
      };
    }
  }
}
