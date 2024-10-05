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

const OfferingTypeSchema = z.object({
  type: z.enum(["lease", "reservation", "sell"]),
});

const ListingSchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  type: z.enum(["property", "land"]),
  address: z.object({
    street: z.string({
      required_error: "street is required",
      invalid_type_error: "street must be a string",
    }),
    city: z.string({
      required_error: "city is required",
      invalid_type_error: "city must be a string",
    }),
    state: z.string({
      required_error: "state is required",
      invalid_type_error: "state must be a string",
    }),
    zip: z
      .string({
        required_error: "zip is required",
        invalid_type_error: "zipe must be a string",
      })
      .optional(),
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
});

const OfferingSchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
  }),
  category: z.enum(["economy", "premium", "luxury"]),
  quantity: z.number({
    required_error: "quantity is required",
    invalid_type_error: "quantity must be a number",
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
  features: z.array(
    z.string({
      required_error: "features are required",
      invalid_type_error: "features must be a string array",
    })
  ),
  lease: z
    .array(
      z.object({
        isNegotiable: z.boolean({
          invalid_type_error: "isNegotiable must be a boolean type",
          required_error: "isNegotiable is required",
        }),
        plan: z.enum(["monthly", "quarterly", "annually"]),
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
        termsAndCondtions: z
          .array(
            z.string({
              invalid_type_error:
                "terms and conditions can only contain string elements",
              required_error: "terms and conditions is required",
            })
          )
          .optional(),
      })
    )
    .optional(),
  reservation: z
    .array(
      z.object({
        plan: z.enum(["daily", "extended"]),
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
        termsAndCondtions: z
          .array(
            z.string({
              invalid_type_error:
                "terms and conditions can only contain string elements",
              required_error: "terms and conditions is required",
            })
          )
          .optional(),
      })
    )
    .optional(),
  sell: z
    .array(
      z.object({
        isNegotiable: z.boolean({
          invalid_type_error: "isNegotiable must be a boolean type",
          required_error: "isNegotiable is required",
        }),
        sale: z.enum(["outright", "instalment"]),
        outright: z
          .object({
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
            discount: z
              .number({
                required_error: "discount is required",
                invalid_type_error: "discount must be a number",
              })
              .optional(),
          })
          .optional(),
        instalment: z
          .object({
            plan: z.enum(["short", "medium", "long"]),
            duration: z.number({
              required_error: "duration is required",
              invalid_type_error: "duration must be a number",
            }),
            downPayment: z.object({
              amount: z.number({
                required_error: "amount is required",
                invalid_type_error: "amount must be a number",
              }),
              currency: z.string({
                required_error: "currency is required",
                invalid_type_error: "currency must be a string",
              }),
            }),
            instalmentPayment: z.object({
              amount: z.number({
                required_error: "amount is required",
                invalid_type_error: "amount must be a number",
              }),
              currency: z.string({
                required_error: "currency is required",
                invalid_type_error: "currency must be a string",
              }),
            }),
            termsAndCondtions: z.array(
              z.string({
                invalid_type_error:
                  "terms and conditions can only contain string elements",
                required_error: "terms and conditions is required",
              })
            ),
          })
          .optional(),
      })
    )
    .optional(),
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
  type: z.enum(["offer", "discount"]),
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

const validateType =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ type: req.params.type });

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(HttpCode.NOT_FOUND).json({
          error: {
            name: HttpStatus.NOT_FOUND,
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
  validateType: validateType(OfferingTypeSchema),
  validateListing: validateBody(ListingSchema),
  validateOffering: validateBody(OfferingSchema),
  validatePromotion: validateBody(PromotionSchema),
};
