import { UserDocument } from "../models/User";
import { Request } from "express";

// Extend Express Request interface to include user property

declare module "express-serve-static-core" {
  interface Request {
    user?: Partial<UserDocument> & { userId: string; role: string };
  }
}
