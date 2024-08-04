import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import HttpStatusCode from "../enum/httpStatusCode";

const singleParamIdSchema = z.object({
  id: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }),
  // .uuid({ message: "Invalid ID format" }),
});

const identitySchema = z.object({
  id: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }),
  // .uuid({ message: "Invalid ID format" }),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email format" }),
});

const validateParams =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          errors: err.errors.map((error) => ({
            path: error.path,
            message: error.message,
          })),
        });
      }
      next(err);
    }
  };

const validateBody =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          errors: err.errors.map((error) => ({
            path: error.path,
            message: error.message,
          })),
        });
      }
      next(err);
    }
  };

export const validateSingleParamId = validateParams(singleParamIdSchema);

export default {
  validateSingleParamId,
};
