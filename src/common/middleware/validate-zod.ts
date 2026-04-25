import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import ApiError from "../utils/api-error.js";

const validateZod = (schema: ZodSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        for (const e of error.issues) {
          const field = e.path.join(".");
          errors[field] = e.message;
        }
        throw ApiError.badRequest("Validation failed", errors);
      }
      throw error;
    }
  };
};

export { validateZod };