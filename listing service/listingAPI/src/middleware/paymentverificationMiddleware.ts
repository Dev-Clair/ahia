import Config from "../../config";
import HttpCode from "../enum/httpCode";
import ProductService from "../service/productService";
import { NextFunction, Request, Response } from "express";

/**
 * Verifies a product payment status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const verifyProductPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const productId = req.params.productId as string;

    const product = await ProductService.Create().findById(productId);

    if (!product?.verification.status)
      return res.status(HttpCode.PAYMENT_REQUIRED).json({
        data: {
          message: `${product?.name.toUpperCase()} has not been verified for listing. Kindly pay the listing fee to verify your product.`,
          url: encodeURI(Config.PAYMENT_SERVICE_URL),
        },
      });

    next();
  } catch (err: any) {
    return next(err);
  }
};

export default { verifyProductPaymentStatus };
