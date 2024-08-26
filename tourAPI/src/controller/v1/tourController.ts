import mongoose from "mongoose";
import AsyncWrapper from "../../utils/asyncWrapper";
import BadRequestError from "../../error/badrequestError";
import Config from "../../../config";
import ConflictError from "../../error/conflictError";
import FailureRetry from "../../utils/failureRetry";
import HttpClient from "../../utils/httpClient";
import HttpCode from "../../enum/httpCode";
import IdempotencyManager from "../../utils/idempotencyManager";
import InternalServerError from "../../error/internalserverError";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../../error/notfoundError";
import { QueryBuilder } from "../../utils/queryBuilder";
import RealtorCache from "../../model/realtorCache";
import ScheduleCache from "../../model/scheduleCache";
import SecretManager from "../../utils/secretManager";
import Tour from "../../model/tour";

/**
 * Creates a new tour resource in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const createTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const { customer, listings } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Tour.create([{ customer, listings }], { session: session });

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.CREATED).json({ data: null });
};

/**
 * Retrieves collection of tours
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getTours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = req.query;

  const queryBuilder = QueryBuilder.Make(Tour.find(), queryString);

  const tours = await queryBuilder
    .Filter()
    .Sort()
    .Select()
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = tours;

  return res.status(HttpCode.OK).json({ data: data, metaData: metaData });
};

/**
 * Retrieves collection of tours based on search
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getToursSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const searchQuery = req.query.search as string;

  if (!searchQuery) throw new BadRequestError("Kindly enter a text to search");

  const search = Tour.find({
    $text: { $search: searchQuery },
  });

  const queryBuilder = QueryBuilder.Make(search);

  const tours = await queryBuilder
    .Sort()
    .Select()
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = tours;

  return res.status(HttpCode.OK).json({ data: data, metaData: metaData });
};

/**
 * Retrieves customer's tour history
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getToursByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const customerId = req.params.customerId as string;

  const queryString = {
    customer: { id: customerId },
  };

  const queryBuilder = QueryBuilder.Make(Tour.find(), queryString);

  const tours = await queryBuilder.Filter().Sort().Select().Exec();

  return res.status(HttpCode.OK).json({ data: tours });
};

/**
 * Retrieves realtor's tour history
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getToursByRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const realtorId = req.params.realtorId as string;

  const queryString = {
    realtor: { id: realtorId },
  };

  const queryBuilder = QueryBuilder.Make(Tour.find(), queryString);

  const tours = await queryBuilder.Filter().Sort().Select().Exec();

  return res.status(HttpCode.OK).json({ data: tours });
};

/**
 * Retrieves a tour resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const tour = await Tour.findById({ _id: id });

  if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);

  return res.status(HttpCode.OK).json({ data: tour });
};

/**
 * Modifies a tour resource in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const updateTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const id = req.params.id as string;

  const payload = req.body as object;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate({ _id: id }, payload, {
      new: true,
      session,
    });

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Removes a tour resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const deleteTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndDelete({ _id: id }, { session });

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Marks a tour resource as completed
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const completeTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "completed", isClosed: true } },
      {
        new: true,
        session,
      }
    );

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);
  });

  return res.status(HttpCode.OK).json({ data: null });
};

/**
 * Marks a tour resource as cancelled
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const cancelTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "cancelled", isClosed: true } },
      {
        new: true,
        session,
      }
    );

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);
  });

  return res.status(HttpCode.OK).json({ data: null });
};

/**
 * Marks a tour resource as reopened
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const reopenTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "pending", isClosed: true } },
      {
        new: true,
        session,
      }
    );

    if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Retrieves realtors from  external IAM API service
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getRealtors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const tour = await Tour.findById({ _id: id });

  if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);

  const url =
    Config.IAM_SERVICE_URL +
    `/realtors?status=available&lng=${tour.location.coordinates[0]}&lat=${tour.location.coordinates[1]}`;

  const serviceName = Config.TOUR.SERVICE.NAME;

  const serviceSecret = await SecretManager.HashSecret(
    Config.TOUR.SERVICE.SECRET,
    Config.APP_SECRET
  );

  const httpClient = new HttpClient(url, {
    "content-type": "application/json",
    "service-name": serviceName,
    "service-secret": serviceSecret,
  });

  const response = await httpClient.Get();

  const { statusCode, body } = response;

  if (statusCode !== HttpCode.OK) {
    if (statusCode === HttpCode.FORBIDDEN) {
      throw new InternalServerError(
        false,
        "Oops! Sorry an error occured on our end, we will resolve it and notify you to retry shortly."
      );
    }

    if (statusCode === HttpCode.INTERNAL_SERVER_ERROR) {
      throw new InternalServerError(
        true,
        "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly."
      );
    }

    if (body.length === 0) {
      throw new InternalServerError(
        false,
        "Oops! Sorry, we could not find any available realtors within your designated location. Please try again shortly."
      );
    }
  }

  return res.status(HttpCode.OK).json({ data: body });
};

/**
 * Selects a realtor from retrieved realtor collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const selectRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const tourId = req.params.id as string;

  const { id, email } = req.query;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await RealtorCache.create(
      [
        {
          tourId: tourId,
          realtor: { id: id, email: email },
        },
      ],
      { session: session }
    );

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.CREATED).json({ data: null });
};

/**
 * Accept realtor request
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const acceptTourRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const realtorCache = await RealtorCache.findOne({ tourId: id });

  if (!realtorCache)
    throw new NotFoundError(`No realtor was found for tour: ${id}`);

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { realtor: realtorCache.realtor } },
      { new: true, session }
    );

    if (!tour) throw new NotFoundError(`No tour found for id: ${id}`);

    await realtorCache.deleteOne({ session });
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Reject realtor request
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const rejectTourRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const realtorCache = await RealtorCache.findOne({ tourId: id });

  if (!realtorCache)
    throw new NotFoundError(`No realtor was found for tour: ${id}`);

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await realtorCache.deleteOne({ session });
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Removes realtor from a tour
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const removeRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const tour = await Tour.findOne({ _id: id, status: "pending" });

  if (!tour) throw new NotFoundError(`No record found for tour: ${id}`);

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    tour.$set(tour.realtor.id, undefined);

    tour.$set(tour.realtor.email, undefined);

    await tour.save({ session });
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Schedules tour date and time
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const scheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const id = req.params.id as string;

  const { date, time } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { schedule: { date: date, time: time } } },
      { new: true, session }
    );

    if (!tour) throw new NotFoundError(`No tour found for id: ${id}`);

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.CREATED).json({ data: null });
};

/**
 * Proposes a reschedule to tour date and time
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const rescheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const id = req.params.id as string;

  const { date, time } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await ScheduleCache.create(
      [
        {
          tourId: id,
          schedule: { date: date, time: time },
        },
      ],
      { session: session }
    );

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.CREATED).json({ data: null });
};

/**
 * Accepts proposed tour reschedule
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const acceptTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const rescheduleId = req.params.rescheduleId as string;

  const scheduleCache = await ScheduleCache.findById({ _id: rescheduleId });

  if (!scheduleCache)
    throw new NotFoundError(
      "schedule not found or has already been processed."
    );

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          schedule: {
            date: scheduleCache.schedule.date,
            time: scheduleCache.schedule.time,
          },
        },
      },
      { new: true, session }
    );

    if (!tour) throw new NotFoundError(`No tour found for id: ${id}`);

    await scheduleCache.deleteOne({ session });
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Rejects proposed tour reschedule
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const rejectTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const rescheduleId = req.params.rescheduleId as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const scheduleCache = await ScheduleCache.findByIdAndDelete(
      {
        _id: rescheduleId,
      },
      { session }
    );

    if (!scheduleCache)
      throw new NotFoundError(
        "schedule not found or has already been processed"
      );
  });

  return res.status(HttpCode.MODIFIED).json({ data: { message: null } });
};

/**
 * Create a new tour in collection
 */
const createTours = AsyncWrapper.Catch(
  createTour,
  FailureRetry.ExponentialBackoff
);

/**
 * Retrieve collection of tours
 */
const retrieveTours = AsyncWrapper.Catch(
  getTours,
  FailureRetry.LinearJitterBackoff
);

/**
 * Retrieve tour search
 */
const retrieveToursSearch = AsyncWrapper.Catch(
  getToursSearch,
  FailureRetry.LinearJitterBackoff
);

/**
 * Retrieve customer's tour history
 */
const retrieveToursByCustomer = AsyncWrapper.Catch(
  getToursByCustomer,
  FailureRetry.LinearJitterBackoff
);

/**
 * Retrieve realtor's tour history
 */
const retrieveToursByRealtor = AsyncWrapper.Catch(
  getToursByRealtor,
  FailureRetry.LinearJitterBackoff
);

/**
 * Retrieve a tour item using its :id
 */
const retrieveTourItem = AsyncWrapper.Catch(
  getTour,
  FailureRetry.LinearJitterBackoff
);

/**
 * Updates a tour item using its :id
 */
const updateTourItem = AsyncWrapper.Catch(
  updateTour,
  FailureRetry.LinearBackoff
);

/**
 * Deletes a tour item using its :id
 */
const deleteTourItem = AsyncWrapper.Catch(
  deleteTour,
  FailureRetry.LinearBackoff
);

/**
 * Complete a tour item using its :id
 */
const completeTourItem = AsyncWrapper.Catch(
  completeTour,
  FailureRetry.LinearBackoff
);

/**
 * Cancels a tour item using its :id
 */
const cancelTourItem = AsyncWrapper.Catch(
  cancelTour,
  FailureRetry.LinearBackoff
);

/**
 * reopens a cancelled tour using its :id
 */
const reopenTourItem = AsyncWrapper.Catch(
  reopenTour,
  FailureRetry.LinearBackoff
);

/**
 * retrieve realtors based on availability and tour location
 */
const retrieveAvailableRealtors = AsyncWrapper.Catch(getRealtors);

/**
 * select a realtor from collection based on availability and tour location
 */
const selectTourRealtor = AsyncWrapper.Catch(selectRealtor);

/**
 * accept tour realtor request
 */
const acceptRealtorRequest = AsyncWrapper.Catch(
  acceptTourRequest,
  FailureRetry.LinearBackoff
);

/**
 * reject tour realtor request
 */
const rejectRealtorRequest = AsyncWrapper.Catch(
  rejectTourRequest,
  FailureRetry.LinearBackoff
);

/**
 * removes realtor from tour
 */
const removeTourRealtor = AsyncWrapper.Catch(
  removeRealtor,
  FailureRetry.LinearBackoff
);

/**
 * schedule a new tour
 */
const scheduleTourItem = AsyncWrapper.Catch(
  scheduleTour,
  FailureRetry.LinearBackoff
);

/**
 * reschedules an existing tour
 */
const rescheduleTourItem = AsyncWrapper.Catch(
  rescheduleTour,
  FailureRetry.LinearBackoff
);

/**
 * accepts proposed tour schedule
 */
const acceptProposedTourReschedule = AsyncWrapper.Catch(acceptTourReschedule);

/**
 * rejects proposed tour schedule
 */
const rejectProposedTourReschedule = AsyncWrapper.Catch(rejectTourReschedule);

export default {
  createTours,
  retrieveTours,
  retrieveToursSearch,
  retrieveToursByCustomer,
  retrieveToursByRealtor,
  retrieveTourItem,
  updateTourItem,
  deleteTourItem,
  completeTourItem,
  cancelTourItem,
  reopenTourItem,
  retrieveAvailableRealtors,
  selectTourRealtor,
  acceptRealtorRequest,
  rejectRealtorRequest,
  removeTourRealtor,
  scheduleTourItem,
  rescheduleTourItem,
  acceptProposedTourReschedule,
  rejectProposedTourReschedule,
};
