import HttpCode from "../enum/httpCode";
import { NextFunction, Request, Response } from "express";
import IPlace from "../interface/IPlace";
import PlaceService from "../service/placeService";

/**
 * Creates a new place in collection
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const createPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const idempotent = req.idempotent as Record<string, any>;

    const payload: Partial<IPlace> = req.body;

    const place = await PlaceService.Create().save(payload, { idempotent });

    return res.status(HttpCode.CREATED).json({ data: place });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a collection of places
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrievePlaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Querystring
    const querystring = (req.query as Record<string, any>) ?? {};

    // Query
    const places = await PlaceService.Create().findAll(querystring);

    return res.status(HttpCode.OK).json({ data: places });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve places by city
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrievePlacesByCity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Querystring
    const querystring = { city: req.query.city as string };

    // Query
    const places = await PlaceService.Create().findAll(querystring);

    return res.status(HttpCode.OK).json({ data: places });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve places by state
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrievePlacesByState = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Querystring
    const querystring = { state: req.query.state as string };

    // Query
    const places = await PlaceService.Create().findAll(querystring);

    return res.status(HttpCode.OK).json({ data: places });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a place by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrievePlaceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const place = await PlaceService.Create().findById(id);

    return res.status(HttpCode.OK).json({ data: place });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  createPlace,
  retrievePlaces,
  retrievePlacesByCity,
  retrievePlacesByState,
  retrievePlaceById,
};
