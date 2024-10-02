import { NextFunction, Request, Response } from "express";
import ListingService from "../service/listingService";
import PaymentRequiredError from "../error/paymentrequiredError";

/**
 * Verifies a listing offering payment status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<void>
 */
const verifyListingOfferingPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const type = req.params.type as string;

    const offering = await ListingService.Create().findOfferingById(
      offeringId,
      type
    );

    if (!offering?.verification.status)
      throw new PaymentRequiredError(
        `${offering?.name.toUpperCase()} has not been verified for listing. Kindly pay the listing fee to verify your product.`
      );

    next();
  } catch (err: any) {
    return next(err);
  }
};

export default { verifyListingOfferingPaymentStatus };
