import { type Request, type Response, type NextFunction } from "express";
import type { IUser, IUserDocument } from "./user.model.js";
import ApiError from "../common/utils/api-error.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../common/utils/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const protectUser = (req: Request, _: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw ApiError.unauthorized("Unauthorized");
    }

    const decoded = verifyToken(token);
    req.user = decoded.user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized("Invalid token");
    }
    throw error;
  }
}

const guestUser = (_: Request, res: Response, next: NextFunction) => {
  const token = _.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      verifyToken(token);
      return res.redirect("/start");
    } catch {
      next();
    }
  } else {
    next();
  }
}

export { protectUser, guestUser }