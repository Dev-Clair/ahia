import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import HttpStatusCode from "../enum/httpStatusCode";

const singleParamIdSchema = z.object({
  id: z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string",
    })
    .uuid({ message: "Invalid ID format" }),
});

const doubleParamIdSchema = singleParamIdSchema.extend({
  rescheduleId: z
    .string({
      invalid_type_error: "Reschedule ID must be a string",
    })
    .uuid({ message: "Invalid Reschedule ID format" })
    .optional(),
});

const customerSchema = z.object({
  customer: z.object({
    id: z
      .string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
      })
      .uuid({ message: "Invalid ID format" }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .email({ message: "Invalid email format" }),
  }),
  listingIds: z
    .array(
      z
        .string({
          required_error: "Listing ID(s) are required",
          invalid_type_error: "Listing ID(s) must be a string",
        })
        .uuid({ message: "Invalid ID format" })
    )
    .nonempty("A new tour must have a collection of listings"),
  transactionRef: z.string({
    required_error: "Listing ID(s) are required",
    invalid_type_error: "Listing ID(s) must be a string",
  }),
});

const realtorSchema = z.object({
  realtor: z.object({
    id: z
      .string({
        required_error: "ID is required",
        invalid_type_error: "ID must be a string",
      })
      .uuid({ message: "Invalid ID format" }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .email({ message: "Invalid email format" }),
  }),
});

const scheduleSchema = z.object({
  scheduledDate: z
    .string({
      required_error: "Scheduled date is required",
      invalid_type_error: "Scheduled date must be a string",
    })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date string",
    }),
  scheduledTime: z
    .string({
      required_error: "Scheduled time is required",
      invalid_type_error: "Scheduled time must be a string",
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
export const validateRealtor = validateBody(realtorSchema);
export const validateSchedule = validateBody(scheduleSchema);

export default {
  validateSingleParamId,
  validateDoubleParamId,
  validateCustomer,
  validateRealtor,
  validateSchedule,
};
