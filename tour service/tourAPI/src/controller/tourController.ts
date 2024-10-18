import HttpCode from "../enum/httpCode";
import IRealtor from "../interface/IRealtor";
import ISchedule from "../interface/ISchedule";
import ITour from "../interface/ITour";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import RealtorService from "../service/realtorService";
import ScheduleService from "../service/scheduleService";
import TourService from "../service/tourService";

/**
 * Creates a new tour in collection
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const createTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<ITour>;

    const tour = await TourService.Create().save(key, payload);

    return res.status(HttpCode.CREATED).json({ data: tour });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Retrieves a collection of tours
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveTours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const tours = await TourService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: tours });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Retrieves customer's tour history
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveToursByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const queryString = { customer: id };

    const tours = await TourService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: tours });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Retrieves realtor's tour history
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveToursByRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const queryString = { realtor: id };

    const tours = await TourService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: tours });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Retrieves a tour by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveTourById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    return res.status(HttpCode.OK).json({ data: tour });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Finds and modifies a tour by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const updateTourById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.idempotent as Record<string, any>;

    const id = req.params.id as string;

    const payload = req.body as Partial<ITour> | any;

    const tour = await TourService.Create().update(id, key, payload);

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: tour });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Finds and removes a tour by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const deleteTourById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const tour = await TourService.Create().delete(id);

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: tour });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Writes a realtor for a tour
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const addTourRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const key = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IRealtor>;

    const tourId = tour._id;

    payload.tour = tourId;

    const realtor = await RealtorService.Create().save(key, payload);

    return res.status(HttpCode.CREATED).json({ data: realtor });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Writes a realtor to a tour
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const acceptTourRealtorRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const key = req.idempotent as Record<string, any>;

    const tourId = tour.id();

    const payload = {} as Partial<ITour> | any;

    const realtor = await TourService.Create().acceptRealtor(
      tourId,
      key,
      payload
    );

    if (!realtor)
      throw new NotFoundError(`No record found for realtor: ${realtor}`);

    return res.status(HttpCode.MODIFIED).json({ data: realtor });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Unwrites a realtor for a tour
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const rejectTourRealtorRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const tourId = tour.id();

    await TourService.Create().rejectRealtor(tourId);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Unwrites a realtor to a tour
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const removeTourRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const key = { key: req.headers["Idempotency-Key"] as string };

    const tourId = tour.id();

    const payload = tour.$set("realtor", "");

    const realtor = await TourService.Create().update(tourId, key, payload);

    return res.status(HttpCode.MODIFIED).json({ data: realtor });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Proposes a reschedule to tour date and time
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const rescheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const key = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<ISchedule>;

    const tourId = tour._id;

    payload.tour = tourId;

    const schedule = await ScheduleService.Create().save(key, payload);

    return res.status(HttpCode.CREATED).json({ data: schedule });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Accepts proposed tour reschedule
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const acceptTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const key = req.idempotent as Record<string, any>;

    const tourId = tour.id();

    const payload = {} as Partial<ITour> | any;

    const schedule = await TourService.Create().acceptReschedule(
      tourId,
      key,
      payload
    );

    if (!schedule)
      throw new NotFoundError(`No record found for schedule: ${schedule}`);

    return res.status(HttpCode.MODIFIED).json({ data: schedule });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Rejects proposed tour reschedule
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const rejectTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const tour = req.tour as ITour;

    const tourId = tour.id();

    await TourService.Create().rejectReschedule(tourId);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (error: any) {
    next(error);
  }
};

export default {
  createTour,
  retrieveTours,
  retrieveToursByCustomer,
  retrieveToursByRealtor,
  retrieveTourById,
  updateTourById,
  deleteTourById,
  addTourRealtor,
  acceptTourRealtorRequest,
  rejectTourRealtorRequest,
  removeTourRealtor,
  rescheduleTour,
  acceptTourReschedule,
  rejectTourReschedule,
};
