// src/types.d.ts

import { IUser } from "../models/User"; // Adjust the import path based on where your IUser model is

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
