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

const doubleParamIdSchema = singleParamIdSchema.extend({
  rescheduleId: z.string({
    invalid_type_error: "Reschedule ID must be a string",
  }),
  // .uuid({ message: "Invalid Reschedule ID format" }),
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

const customerSchema = z.object({
  customer: identitySchema,
  listings: z
    .array(
      z.object({
        id: z.string({
          required_error: "Listing ID is required",
          invalid_type_error: "Listing ID must be a string",
        }),
        // .uuid({ message: "Invalid ID format" }),
        location: z.string({
          required_error: "Listing location is required",
          invalid_type_error: "Listing location must be a string",
        }),
      })
    )
    .nonempty("A new tour must have a collection of listings id and location"),
  transactionRef: z.string({
    required_error: "Transaction reference is required",
    invalid_type_error: "Transaction reference must be a string",
  }),
});

const scheduleSchema = z.object({
  date: z
    .string({
      required_error: "Date is required",
      invalid_type_error: "Date must be a string",
    })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date string",
    }),
  time: z
    .string({
      required_error: "Time is required",
      invalid_type_error: "Time must be a string",
    })
    .regex(/^\d{2}:\d{2}$/, { message: "Invalid time string" }),
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

export const validateDoubleParamId = validateParams(doubleParamIdSchema);

export const validateCustomer = validateBody(customerSchema);

export const validateSchedule = validateBody(scheduleSchema);

export default {
  validateSingleParamId,
  validateDoubleParamId,
  validateCustomer,
  validateSchedule,
};
