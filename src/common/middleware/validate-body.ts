import { type Request, type Response, type NextFunction } from "express";
import ApiError from "../utils/api-error.js";

const validateBody = <T>(requiredFields: (keyof T)[]) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw ApiError.badRequest("Please provide required fields");
    }

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw ApiError.badRequest(`Please provide ${missingFields.join(", ")}`);
    }

    next();
  };
};

export { validateBody };