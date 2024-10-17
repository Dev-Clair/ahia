import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

const IDSchema = z.object({
  id: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }),
});

const TourSchema = z.object({
  customer: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }),
  offerings: z
    .array(
      z.object({
        id: z.string({
          required_error: "Offering ID is required",
          invalid_type_error: "Offering ID must be a string",
        }),
      })
    )
    .nonempty("A new tour must have a collection of offerings"),
});

const ScheduleSchema = z.object({
  date: z.string({
    required_error: "Date is required",
    invalid_type_error: "Date must be a string",
  }),
  time: z.string({
    required_error: "Time is required",
    invalid_type_error: "Time must be a string",
  }),
});

const validateParams =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ id: req.params.id });

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
          name: HttpStatus.UNPROCESSABLE_ENTITY,
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
        return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
          name: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: err.errors.map((error) => ({
            path: error.path,
            message: error.message,
          })),
        });
      }
      next(err);
    }
  };

export const validateID = validateParams(IDSchema);

export const validateTour = validateBody(TourSchema);

export const validateSchedule = validateBody(ScheduleSchema);

export default {
  validateID,
  validateTour,
  validateSchedule,
};
