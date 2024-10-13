import Config from "../../config";
import HttpCode from "../enum/httpCode";
import ListingService from "../service/listingService";
import { NextFunction, Request, Response } from "express";

/**
 * Verifies an offering payment status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const verifyOfferingPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const type = req.params.type as string;

    const offering = await ListingService.Create().findListingOfferingById(
      offeringId,
      type
    );

    if (!offering?.verification.status)
      return res.status(HttpCode.REDIRECT).json({
        data: {
          message: `${offering?.name.toUpperCase()} has not been verified for listing. Kindly pay the listing fee to verify your product.`,
          redirect: encodeURI(Config.PAYMENT_SERVICE_URL),
        },
      });

    next();
  } catch (err: any) {
    return next(err);
  }
};

export default { verifyOfferingPaymentStatus };
