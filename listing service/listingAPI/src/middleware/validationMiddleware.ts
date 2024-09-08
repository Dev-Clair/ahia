import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

const IdSchema = z.object({
  id: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }),
});

const LeaseSchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  type: z.enum(["economy", "premium", "luxury"]),
  category: z.enum(["residential", "commercial", "mixed"]),
  address: z.string({
    required_error: "address is required",
    invalid_type_error: "address must be a string",
  }),
  location: z.object({
    coordinates: z.array(
      z.number({
        invalid_type_error: "location coordinates must be a number array",
        required_error: "coordinates are required",
        message: "location coordinates must be of Point type",
        description: `"coordinates": [lng|long, lat]`,
      })
    ),
  }),
  isNegotiable: z.boolean({
    invalid_type_error: "isNegotiable must be a boolean type",
    required_error: "isNegotiable is required",
  }),
  rental: z.object({
    plan: z.enum(["monthly", "quarterly", "annually"]),
    termsAndCondtions: z
      .array(
        z.string({
          invalid_type_error:
            "terms and conditions can only contain string elements",
          required_error: "terms and conditions is required",
        })
      )
      .optional(),
  }),
});

const ReservationSchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  type: z.enum(["economy", "premium", "luxury"]),
  category: z.enum(["residential", "commercial", "mixed"]),
  address: z.string({
    required_error: "address is required",
    invalid_type_error: "address must be a string",
  }),
  location: z.object({
    coordinates: z.array(
      z.number({
        invalid_type_error: "location coordinates must be a number array",
        required_error: "coordinates are required",
        message: "location coordinates must be of Point type",
        description: `"coordinates": [lng|long, lat]`,
      })
    ),
  }),
  booking: z.object({
    plan: z.enum(["daily", "extended"]),
    termsAndCondtions: z
      .array(
        z.string({
          invalid_type_error:
            "terms and conditions can only contain string elements",
          required_error: "terms and conditions is required",
        })
      )
      .optional(),
  }),
});

const SellSchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  type: z.enum(["economy", "premium", "luxury"]),
  category: z.enum(["residential", "commercial", "mixed"]),
  address: z.string({
    required_error: "address is required",
    invalid_type_error: "address must be a string",
  }),
  location: z.object({
    coordinates: z.array(
      z.number({
        invalid_type_error: "location coordinates must be a number array",
        required_error: "coordinates are required",
        message: "location coordinates must be of Point type",
        description: `"coordinates": [lng|long, lat]`,
      })
    ),
  }),
  isNegotiable: z.boolean({
    invalid_type_error: "isNegotiable must be a boolean type",
    required_error: "isNegotiable is required",
  }),
  mortgage: z.object({
    plan: z.enum(["short", "medium", "long"]),
    termsAndCondtions: z
      .array(
        z.string({
          invalid_type_error:
            "terms and conditions can only contain string elements",
          required_error: "terms and conditions is required",
        })
      )
      .optional(),
  }),
});

const OfferingSchema = z.object({});

const PromotionSchema = z.object({});

const validateID =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params.id);

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
  validateLease: validateBody(LeaseSchema),
  validateReservation: validateBody(ReservationSchema),
  validateSell: validateBody(SellSchema),
};
