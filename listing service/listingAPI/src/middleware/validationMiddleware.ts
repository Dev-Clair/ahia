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
  propertyType: z.enum(["economy", "premium", "luxury"]),
  propertyCategory: z.enum(["residential", "commercial", "mixed"]),
  address: z.object({
    street: z.string({
      required_error: "street is required",
      invalid_type_error: "street must be a string",
    }),
    countyLGA: z.string({
      required_error: "countyLGA is required",
      invalid_type_error: "countyLGA must be a string",
    }),
    city: z.string({
      required_error: "city is required",
      invalid_type_error: "city must be a string",
    }),
    state: z.string({
      required_error: "state is required",
      invalid_type_error: "state must be a string",
    }),
  }),
  location: z.object({
    geoCoordinates: z.array(
      z.number({
        invalid_type_error: "location geoCoordinates must be a number array",
        required_error: "geoCoordinates are required",
        message: "location geoCoordinates must be of Point type",
        description: `"geoCoordinates": [lng|long, lat]`,
      })
    ),
  }),
  isNegotiable: z.boolean({
    invalid_type_error: "isNegotiable must be a boolean type",
    required_error: "isNegotiable is required",
  }),
  rental: z.object({
    plan: z.enum(["monthly", "quarterly", "annually", "mixed"]),
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
  propertyType: z.enum(["economy", "premium", "luxury"]),
  propertyCategory: z.enum(["residential", "commercial", "mixed"]),
  address: z.object({
    street: z.string({
      required_error: "street is required",
      invalid_type_error: "street must be a string",
    }),
    countyLGA: z.string({
      required_error: "countyLGA is required",
      invalid_type_error: "countyLGA must be a string",
    }),
    city: z.string({
      required_error: "city is required",
      invalid_type_error: "city must be a string",
    }),
    state: z.string({
      required_error: "state is required",
      invalid_type_error: "state must be a string",
    }),
  }),
  location: z.object({
    geoCoordinates: z.array(
      z.number({
        invalid_type_error: "geoCoordinates must be a number array",
        required_error: "geoCoordinates are required",
        message: "geoCoordinates must be of Point type",
        description: `"geoCoordinates": [lng|long, lat]`,
      })
    ),
  }),
  booking: z.object({
    plan: z.enum(["daily", "extended", "mixed"]),
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
  propertyType: z.enum(["economy", "premium", "luxury"]),
  propertyCategory: z.enum(["residential", "commercial", "mixed"]),
  address: z.object({
    street: z.string({
      required_error: "street is required",
      invalid_type_error: "street must be a string",
    }),
    countyLGA: z.string({
      required_error: "countyLGA is required",
      invalid_type_error: "countyLGA must be a string",
    }),
    city: z.string({
      required_error: "city is required",
      invalid_type_error: "city must be a string",
    }),
    state: z.string({
      required_error: "state is required",
      invalid_type_error: "state must be a string",
    }),
  }),
  location: z.object({
    geoCoordinates: z.array(
      z.number({
        invalid_type_error: "geoCoordinates must be a number array",
        required_error: "geoCoordinates are required",
        message: "geoCoordinates must be of Point type",
        description: `"geoCoordinates": [lng|long, lat]`,
      })
    ),
  }),
  isNegotiable: z.boolean({
    invalid_type_error: "isNegotiable must be a boolean type",
    required_error: "isNegotiable is required",
  }),
  mortgage: z.object({
    plan: z.enum(["short", "medium", "long", "flexible"]),
    duration: z.date({
      required_error: "duration is required",
      invalid_type_error: "duration must be a date",
    }),
    initialDeposit: z.number({
      required_error: "initialDeposit is required",
      invalid_type_error: "initialDeposit must be a number",
    }),
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

const OfferingSchema = z.object({
  offeringType: z.string({
    required_error: "offeringType is required",
    invalid_type_error: "offeringType must be a string",
  }),
  unitsAvailable: z.number({
    required_error: "unitsAvailable is required",
    invalid_type_error: "unitsAvailable must be a number",
  }),
  area: z.object({
    size: z.number({
      required_error: "size is required",
      invalid_type_error: "size must be a number",
    }),
    unit: z.string({
      required_error: "unit is required",
      invalid_type_error: "unit must be a string",
    }),
  }),
  price: z.object({
    amount: z.number({
      required_error: "amount is required",
      invalid_type_error: "amount must be a number",
    }),
    currency: z.string({
      required_error: "currency is required",
      invalid_type_error: "currency must be a string",
    }),
  }),
  features: z.array(
    z.string({
      required_error: "features are required",
      invalid_type_error: "features must be a string array",
    })
  ),
  status: z.enum(["open", "closed"]).optional(),
});

const PromotionSchema = z.object({
  title: z.string({
    required_error: "title is required",
    invalid_type_error: "title must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a number",
  }),
  promotionType: z.enum(["offer", "discount"]),
  rate: z.number({
    required_error: "rate is required",
    invalid_type_error: "rate must be a number",
  }),
  startDate: z.date({
    required_error: "startDate is required",
    invalid_type_error: "startDate must be a date",
  }),
  endDate: z.date({
    required_error: "endDate is required",
    invalid_type_error: "endDate must be a date",
  }),
});

const validateID =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ id: req.params.id });

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
  validateOffering: validateBody(OfferingSchema),
  validatePromotion: validateBody(PromotionSchema),
};
