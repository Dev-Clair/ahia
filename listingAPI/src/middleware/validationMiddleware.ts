import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

const IdSchema = z.object({
  id: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }),
  // .uuid({ message: "Invalid ID format" }),
});

const BodySchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  cost: z.number({
    required_error: "cost is required",
    invalid_type_error: "cost cannot be a negative number",
  }),
  purpose: z.enum(["lease", "sell"]),
  type: z.enum(["on-going", "now-selling"]),
  category: z.enum(["economy", "premium", "luxury"]),
  use: z.object({
    type: z.string({
      required_error: "use type is required",
      invalid_type_error: "use type must be a string",
    }),
    category: z.enum(["residential", "commercial", "mixed"]),
  }),
  features: z.array(
    z.string({
      required_error: "features is required",
      invalid_type_error: "features must be a string",
    })
  ),
  address: z.object({
    street: z.string({
      required_error: "street is required",
      invalid_type_error: "street must be a string",
    }),
    zone: z.string({
      required_error: "zone is required",
      invalid_type_error: "zone must be a string",
    }),
    countyLGA: z.string({
      required_error: "countyLGA is required",
      invalid_type_error: "countyLGA must be a string",
    }),
    state: z.string({
      required_error: "state is required",
      invalid_type_error: "state must be a string",
    }),
  }),
});

const validateID =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
          error: {
            name: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: err.errors.map((error) => ({
              path: error.path,
              message: error.message,
            })),
          },
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
        return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
          error: {
            name: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: err.errors.map((error) => ({
              path: error.path,
              message: error.message,
            })),
          },
        });
      }
      next(err);
    }
  };

export default {
  validateID: validateID(IdSchema),
  validateBody: validateBody(BodySchema),
};
