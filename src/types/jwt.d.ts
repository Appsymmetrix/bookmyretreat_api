import { User } from './models/User'; // Adjust the path if needed

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
      };
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
