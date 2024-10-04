import HttpCode from "../enum/httpCode";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import IOffering from "../interface/IOffering";
import OfferingService from "../service/offeringService";

/**
 * Retrieve offerings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
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
 * Retrieve offerings by space
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingsBySpace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const spaceName = req.query.name as string;

    const spaceType = req.query.type as string;

    const queryString = { space: { name: spaceName, type: spaceType } };

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const status = req.query.status as string;

    const queryString = { status: status };

    const offerings = await OfferingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by promotion
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingsByPromotion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const promotion = req.query.promotion as string;

    const queryString = { promotion: promotion };

    const offerings = await OfferingService.Create().findAll(queryString);

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
 * @returns Promise<Response | void>
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
 * Retrieves an offering by slug
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingBySlug = async (
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
 * Retrieves an offering by id and populate it's subdocument
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingByIdAndPopulate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const offering = await OfferingService.Create().findByIdAndPopulate(id);

    if (!offering)
      throw new NotFoundError(`No record found for offering: ${id}`);

    return res.status(HttpCode.OK).json({ data: { offering } });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves an offering by slug and populate it's subdocument
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingBySlugAndPopulate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const slug = req.params.slug as string;

    const offering = await OfferingService.Create().findBySlugAndPopulate(slug);

    if (!offering)
      throw new NotFoundError(`No record found for offering: ${slug}`);

    return res.status(HttpCode.OK).json({ data: { offering } });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  retrieveOfferings,
  retrieveOfferingsBySpace,
  retrieveOfferingsByStatus,
  retrieveOfferingsByPromotion,
  retrieveOfferingById,
  retrieveOfferingBySlug,
  retrieveOfferingByIdAndPopulate,
  retrieveOfferingBySlugAndPopulate,
};
