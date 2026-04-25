import { type Request, type Response, type NextFunction } from "express";
import ApiError from "../utils/api-error.js";

const errorHandler = (err: Error, _: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export { errorHandler };