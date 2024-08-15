import mongoose from "mongoose";
import AsyncCatch from "../../utils/asyncCatch";
import CryptoHash from "../../utils/cryptoHash";
import Config from "../../../config";
import ConflictError from "../../error/conflictError";
import { NextFunction, Request, Response } from "express";
import HttpClient from "../../../httpClient";
import HttpStatusCode from "../../enum/httpStatusCode";
import Idempotent from "../../utils/idempotency";
import InternalServerError from "../../error/internalserverError";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import { QueryBuilder } from "../../utils/queryBuilder";
import Retry from "../../utils/retry";
import Tour from "../../model/tour";
import RealtorCache from "../../model/realtorCache";
import ScheduleCache from "../../model/scheduleCache";

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

  if (await Idempotent.Verify(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

  const { customer, listings } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Tour.create([{ customer, listings }], { session: session });

    await Idempotent.Ensure(idempotencyKey, session);
  });

  // await Mail(); // Send mail to customer confirming tour creation success

  // await Notify(); // Send push notification to customer to modify tour name, schedule tour date and time and select realtor

  return res.status(HttpStatusCode.CREATED).json({ data: null });
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
  const queryString = req.query ?? {};

  const queryBuilder = new QueryBuilder(Tour.find(), queryString);

  const tours = await queryBuilder
    .filter()
    .sort()
    .select(["-isClosed, -customer.email, -realtor.email"])
    .paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = tours;

  return res.status(HttpStatusCode.OK).json({ data: data, metaData: metaData });
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
  const searchQuery = (req.query.search as string) ?? "";

  const search = Tour.find({
    $text: { $search: searchQuery },
  });

  const queryBuilder = new QueryBuilder(search, {});

  const tours = await queryBuilder
    .sort()
    .select(["-isClosed, -customer.email, -realtor.email"])
    .paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = tours;

  return res.status(HttpStatusCode.OK).json({ data: data, metaData: metaData });
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
  const queryString = req.query;

  const queryBuilder = new QueryBuilder(Tour.find(), queryString);

  const tours = await queryBuilder
    .filter()
    .sort()
    // .select()
    .exec();

  return res.status(HttpStatusCode.OK).json({ data: tours });
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
  const queryString = req.query;

  const queryBuilder = new QueryBuilder(Tour.find(), queryString);

  const tours = await queryBuilder
    .filter()
    .sort()
    // .select()
    .exec();

  return res.status(HttpStatusCode.OK).json({ data: tours });
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
  const tour = await Tour.findById({ _id: req.params.id });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  return res.status(HttpStatusCode.OK).json({ data: tour });
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

  if (await Idempotent.Verify(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

  const id = req.params.id as string;

  const payload = req.body as object;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate({ _id: id }, payload, {
      new: true,
      session,
    });

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }

    await Idempotent.Ensure(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }
  });

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }
  });

  // await Notify() // Send push notification confirming completion and requesting a review

  return res.status(HttpStatusCode.OK).json({ data: null });
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

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }
  });

  // await Notify() // Send push notification confirming cancellation and requesting a reason

  return res.status(HttpStatusCode.OK).json({ data: null });
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

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }
  });

  // await Notify() // Send push notification confirming reopening

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  const url =
    Config.IAM_SERVICE_URL +
    `/realtors?status=available&location=${tour.location}`;

  const httpClient = new HttpClient(url, {
    "content-type": "application/json",
    "service-name": Config.TOUR.SERVICE.NAME,
    "service-secret": await CryptoHash(
      Config.TOUR.SERVICE.SECRET,
      Config.APP_SECRET
    ),
  });

  const response = await httpClient.Get();

  const { statusCode, body } = response;

  if (statusCode !== HttpStatusCode.OK) {
    if (statusCode === HttpStatusCode.FORBIDDEN) {
      throw new InternalServerError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Oops! Sorry an error occured on our end, we will resolve it and notify you to retry shortly."
      );
    }

    if (statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR) {
      throw new InternalServerError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        true,
        "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly."
      );
    }

    if (body.length === 0) {
      throw new InternalServerError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Oops! Sorry, we could not find any available realtors within your designated location. Please try again shortly."
      );
    }
  }

  return res.status(HttpStatusCode.OK).json({ data: body });
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

  if (await Idempotent.Verify(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

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

    await Idempotent.Ensure(idempotencyKey, session);
  });

  // await Notify() // Send push notification to realtor about tour request

  return res.status(HttpStatusCode.CREATED).json({ data: null });
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

  if (!realtorCache) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No realtor was found for tour: ${id}`
    );
  }

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { realtor: realtorCache.realtor } },
      { new: true, session }
    );

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }

    await realtorCache.deleteOne({ session });
  });

  // await Notify() // Send realtor's acceptance push notification to customer

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

  if (!realtorCache) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No realtor was found for tour: ${id}`
    );
  }

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await realtorCache.deleteOne({ session });
  });

  // await Notify() // Send realtor's rejection push notification to customer

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

/**
 * Exits or removes a realtor from a tour
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const exitTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const tour = await Tour.findOne({ _id: id, status: "pending" });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No record found for tour: ${id}`
    );
  }

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    tour.$set(tour.realtor.id, undefined);

    tour.$set(tour.realtor.email, undefined);

    await tour.save({ session });
  });

  // await Notify() // Notify customer on realtor's tour exit

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

  if (await Idempotent.Verify(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

  const id = req.params.id as string;

  const { date, time } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { $set: { schedule: { date: date, time: time } } },
      { new: true, session }
    );

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }

    await Idempotent.Ensure(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.CREATED).json({ data: null });
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

  if (await Idempotent.Verify(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

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

    await Idempotent.Ensure(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.CREATED).json({ data: null });
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

  if (!scheduleCache) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or has already been processed."
    );
  }

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

    if (!tour) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        `No tour found for id: ${id}`
      );
    }

    await scheduleCache.deleteOne({ session });
  });

  // await Notify(); // Send push notification to Customer and Realtor

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

    if (!scheduleCache) {
      throw new NotFoundError(
        HttpStatusCode.NOT_FOUND,
        "schedule not found or has already been processed."
      );
    }
  });

  // await Notify();  // Send push notification to Customer or Realtor

  return res.status(HttpStatusCode.MODIFIED).json({ data: { message: null } });
};

/**
 * Create a new tour in collection.
 */
const createTours = AsyncCatch(createTour, Retry.ExponentialBackoff);

/**
 * Retrieve collection of tours.
 */
const retrieveTours = AsyncCatch(getTours, Retry.LinearJitterBackoff);

/**
 * Retrieve tour search.
 */
const retrieveToursSearch = AsyncCatch(
  getToursSearch,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve customer's tour history.
 */
const retrieveToursByCustomer = AsyncCatch(
  getToursByCustomer,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve realtor's tour history.
 */
const retrieveToursByRealtor = AsyncCatch(
  getToursByRealtor,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncCatch(getTour, Retry.LinearJitterBackoff);

/**
 * Updates a tour item using its :id.
 */
const updateTourItem = AsyncCatch(updateTour, Retry.LinearBackoff);

/**
 * Deletes a tour item using its :id.
 */
const deleteTourItem = AsyncCatch(deleteTour, Retry.LinearBackoff);

/**
 * Complete a tour item using its :id.
 */
const completeTourItem = AsyncCatch(completeTour, Retry.LinearBackoff);

/**
 * Cancels a tour item using its :id.
 */
const cancelTourItem = AsyncCatch(cancelTour, Retry.LinearBackoff);

/**
 * reopens a cancelled tour using its :id.
 */
const reopenTourItem = AsyncCatch(reopenTour, Retry.LinearBackoff);

/**
 * retrieve realtors based on availability and tour location
 */
const retrieveAvailableRealtors = AsyncCatch(getRealtors);

/**
 * select a realtor from collection based on availability and tour location
 */
const selectTourRealtor = AsyncCatch(selectRealtor);

/**
 * accept tour realtor request
 */
const acceptRealtorRequest = AsyncCatch(acceptTourRequest, Retry.LinearBackoff);

/**
 * reject tour realtor request
 */
const rejectRealtorRequest = AsyncCatch(rejectTourRequest, Retry.LinearBackoff);

/**
 * exit from a tour
 */
const exitTourItem = AsyncCatch(exitTour, Retry.LinearBackoff);

/**
 * schedule a new tour.
 */
const scheduleTourItem = AsyncCatch(scheduleTour, Retry.LinearBackoff);

/**
 * reschedules an existing tour.
 */
const rescheduleTourItem = AsyncCatch(rescheduleTour, Retry.LinearBackoff);

/**
 * accepts proposed tour schedule.
 */
const acceptProposedTourReschedule = AsyncCatch(acceptTourReschedule);

/**
 * rejects proposed tour schedule.
 */
const rejectProposedTourReschedule = AsyncCatch(rejectTourReschedule);

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
  exitTourItem,
  scheduleTourItem,
  rescheduleTourItem,
  acceptProposedTourReschedule,
  rejectProposedTourReschedule,
};
