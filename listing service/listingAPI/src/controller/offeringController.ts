import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import IOffering from "../interface/IOffering";
import OfferingService from "../service/offeringService";

/**
 * Retrieve offerings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of offerings based on search query
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const offerings = await OfferingService.Create().findAll(searchQuery);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves offerings by location (geo-coordinates)
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    queryString.lat = req.geoCoordinates?.lat;

    queryString.lng = req.geoCoordinates?.lng;

    queryString.radius = req.geoCoordinates?.radius;

    const offerings = await OfferingService.Create().findOfferingsByLocation(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings near user's location
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsNearBy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const offerings = await OfferingService.Create().findOfferingsByLocation(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by status: now-booking
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsAvailableForBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query as Record<string, any>;

    const queryString = {
      ...query,
      type: "Reservation",
      status: "now-booking",
    };

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by status: now-letting
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsAvailableForLetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query as Record<string, any>;

    const queryString = { ...query, type: "Lease", status: "now-letting" };

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by status: now-selling
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsAvailableForSelling = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query as Record<string, any>;

    const queryString = { ...query, type: "Sell", status: "now-selling" };

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by product (filter: name, category, area, type)
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const name = req.query.name as string;

    const category = req.query.category as string;

    const type = req.query.type as string;

    const area = {
      size: () => {
        let size = {} as Record<string, any>;

        const minArea = parseInt((req.query?.minArea as string) ?? "", 10);

        const maxArea = parseInt((req.query?.maxArea as string) ?? "", 10);

        if (minArea !== undefined || maxArea !== undefined) {
          if (minArea !== undefined) size["gte"] = minArea;

          if (maxArea !== undefined) size["lte"] = maxArea;
        }

        return size;
      },
    };

    const queryString = {
      product: { name: name, category: category, type: type, area: area },
    };

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves offerings by provider
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingsByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const provider = req.query.provider as string;

    const queryString = { provider: { slug: provider } };

    const offerings = await OfferingService.Create().findOfferingsByProvider(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves an offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offering = req.offering as IOffering;

    return res.status(HttpCode.OK).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves an offering by id and populate its subdocument
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveOfferingByIdAndPopulate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const type = req.query.type as string;

    const offering = await OfferingService.Create().findByIdAndPopulate(
      id,
      type
    );

    if (!offering)
      throw new NotFoundError(`No record found for offering: ${id}`);

    return res.status(HttpCode.OK).json({ data: { offering } });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  retrieveOfferings,
  retrieveOfferingsSearch,
  retrieveOfferingsByLocation,
  retrieveOfferingsNearBy,
  retrieveOfferingsByProduct,
  retrieveOfferingsByProvider,
  retrieveOfferingsAvailableForBooking,
  retrieveOfferingsAvailableForLetting,
  retrieveOfferingsAvailableForSelling,
  retrieveOfferingById,
  retrieveOfferingByIdAndPopulate,
};
