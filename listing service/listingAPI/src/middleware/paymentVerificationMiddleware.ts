import { NextFunction, Request, Response } from "express";
import IListing from "../interface/IListing";
import ListingService from "../service/listingService";
import PaymentRequiredError from "../error/paymentrequiredError";

/**
 * Verifies a listing payment status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<void>
 */
const verifyListingPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const listing = req.listing
      ? (req.listing as IListing)
      : await ListingService.Create().findById(req.params.id as string);

    if (!listing?.verification.status)
      throw new PaymentRequiredError(
        `${listing?.name.toUpperCase()} has not been verified for listing. Kindly pay the listing fee to verify your listing.`
      );

    next();
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Verifies a listing offering payment status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<void>
 */
const verifyOfferingPaymentStatus = async (
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

    if (offering?.featured.status === false)
      throw new PaymentRequiredError(
        `${offering?.name.toUpperCase()} has not been featured for listing. Kindly pay the listing fee to feature your offering.`
      );

    next();
  } catch (err: any) {
    return next(err);
  }
};

export default { verifyListingPaymentStatus, verifyOfferingPaymentStatus };
