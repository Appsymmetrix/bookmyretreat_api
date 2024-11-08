import { IUser } from "../models/User";
import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<IUser, "password" | "createdAt">;
    }
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    EMAIL_SOURCE: string;
  }
}
