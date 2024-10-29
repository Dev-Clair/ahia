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

const ListingTypeSchema = z.object({
  type: z.enum(["land", "mobile", "property"]),
});

const ProductTypeSchema = z.object({
  type: z.enum(["lease", "reservation", "sell"]),
});

const ProductStatusSchema = z.object({
  type: z.enum(["now-letting", "now-booking", "now-selling"]),
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
  type: z.enum(["land", "mobile", "property"]),
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
    coordinates: z.array(
      z.number({
        invalid_type_error: "location coordinates must be a number array",
        required_error: "location coordinates are required",
        message: "location coordinates must be of point type",
        description: "location coordinates: [lng, lat]",
      })
    ),
  }),
});

const ProductSchema = z.object({
  name: z.string({
    required_error: "name is required",
    invalid_type_error: "name must be a string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description must be a string",
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
        termsAndConditions: z
          .array(
            z.string({
              required_error: "terms and conditions is required",
              invalid_type_error:
                "terms and conditions can only contain string elements",
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
        termsAndConditions: z
          .array(
            z.string({
              required_error: "terms and conditions is required",
              invalid_type_error:
                "terms and conditions can only contain string elements",
            })
          )
          .optional(),
      })
    )
    .optional(),
  sell: z
    .object({
      outright: z.object({
        isNegotiable: z.boolean({
          invalid_type_error: "isNegotiable must be a boolean type",
          required_error: "isNegotiable is required",
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
        discount: z
          .number({
            required_error: "discount is required",
            invalid_type_error: "discount must be a number",
          })
          .optional(),
        termsAndConditions: z
          .array(
            z.string({
              required_error: "terms and conditions is required",
              invalid_type_error:
                "terms and conditions can only contain string elements",
            })
          )
          .optional(),
      }),
      instalment: z.array(
        z
          .object({
            isNegotiable: z.boolean({
              invalid_type_error: "isNegotiable must be a boolean type",
              required_error: "isNegotiable is required",
            }),
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
            termsAndConditions: z
              .array(
                z.string({
                  required_error: "terms and conditions is required",
                  invalid_type_error:
                    "terms and conditions can only contain string elements",
                })
              )
              .optional(),
          })
          .optional()
      ),
    })
    .optional(),
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

const validateStatus =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ status: req.params.status });

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
  validateListingType: validateType(ListingTypeSchema),
  validateProductType: validateType(ProductTypeSchema),
  validateProductStatus: validateStatus(ProductStatusSchema),
  validateListing: validateBody(ListingSchema),
  validateProduct: validateBody(ProductSchema),
};
