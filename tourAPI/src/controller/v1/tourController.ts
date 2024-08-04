import AsyncCatch from "../../utils/asyncCatch";
import EnsureIdempotency from "../../utils/ensureIdempotency";
import Config from "../../../config";
import { NextFunction, Request, Response } from "express";
import Features from "../../utils/feature";
import HttpClient from "../../../httpClient";
import HttpStatusCode from "../../enum/httpStatusCode";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import InternalServerError from "../../error/internalserverError";
import DuplicateTransactionError from "../../error/duplicateTransactionError";
import PaymentEventPayloadError from "../../error/paymentEventPayloadError";
import Retry from "../../utils/retry";
import Tour from "../../model/tourModel";
import Idempotency from "../../model/idempotencyModel";
import Realtor from "../../model/realtorModel";
import Schedule from "../../model/scheduleModel";

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
  const { customer, listings, transactionRef } = req.body;

  if (!customer || !listings! || transactionRef) {
    throw new PaymentEventPayloadError("Invalid request body data structure");
  }

  const verifyOperationIdempotency = await Idempotency.findOne({
    key: transactionRef,
  });

  if (verifyOperationIdempotency) {
    throw new DuplicateTransactionError(
      `Duplicate transaction reference detected: ${transactionRef}`
    );
  }

  await Tour.create({ customer, listings });

  const response = { data: "Created" };

  await Idempotency.create({
    key: transactionRef,
    response: response,
  });

  // await Mail(); // Send mail to customer confirming tour creation success

  // await Notify(); // Send push notification to customer to modify tour name, schedule tour date and time and select realtor

  return res.status(HttpStatusCode.CREATED).json(response);
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
  const { data, pagination } = await Features(Tour, {}, req);

  return res.status(HttpStatusCode.OK).json({
    data: data,
    page: pagination.page,
    limit: pagination.limit,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    links: pagination.links,
  });
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
  const idempotencyKey = EnsureIdempotency(req, res);

  const id = req.params.id as string;

  const payload = req.body as object;

  const tour = await Tour.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  const response = { data: "Modified" };

  await Idempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.MODIFIED).json(response);
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

  const tour = await Tour.findByIdAndDelete({ _id: id });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  return res.status(HttpStatusCode.MODIFIED).json({ data: { message: null } });
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

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { $set: { status: "completed", isClosed: true } },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  // await Notify() // Send push notification confirming completion and requesting a review

  return res.status(HttpStatusCode.OK).json({ data: { message: null } });
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

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { $set: { status: "cancelled", isClosed: true } },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  // await Notify() // Send push notification confirming cancellation and requesting a reason

  return res.status(HttpStatusCode.OK).json({ data: { message: null } });
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

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { $set: { status: "pending", isClosed: false } },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No cancelled tour found for id: ${id}`
    );
  }

  // await Notify() // Send push notification confirming reopening

  return res
    .status(HttpStatusCode.OK)
    .json({ data: { message: "Your tour has been successfully reopened" } });
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

  const httpClient = new HttpClient(
    `www.ahia.com/iam/realtors?status=available&location=${tour.location}`,
    {
      "Content-Type": "application/json",
      "Service-Name": Config.SERVICE.NAME,
      "Service-Secret": Config.SERVICE.SECRET,
    }
  );

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
  const idempotencyKey = EnsureIdempotency(req, res);

  const tourId = req.params.id as string;

  const { id, email } = req.query;

  await Realtor.create({
    tourId: tourId,
    realtor: { id: id, email: email },
  });

  // await Notify() // Send push notification to realtor about tour request

  const response = {
    data: {
      message:
        "Realtor has been notified of your request. Realtor's confirmation status will be communicated to you accordingly.",
    },
  };

  await Idempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
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

  const request = await Realtor.findOne({ tourId: id });

  if (!request) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No realtor request found for tour: ${id}`
    );
  }

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { $set: { realtor: request.realtor } }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  await request.deleteOne();

  // await Notify() // Send realtor's acceptance push notification to customer

  return res.status(HttpStatusCode.MODIFIED).json({
    data: { message: `Congratulations, you have been added to tour: ${id}` },
  });
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

  const request = await Realtor.findOne({ tourId: id });

  if (!request) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No realtor request found for tour: ${id}`
    );
  }

  await request.deleteOne();

  // await Notify() // Send realtor's rejection push notification to customer

  return res.status(HttpStatusCode.MODIFIED).json({
    data: { message: `Successfully rejected realtor request for tour: ${id}` },
  });
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
  const id = req.params.id as string;

  const { date, time } = req.body;

  const idempotencyKey = EnsureIdempotency(req, res);

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { $set: { schedule: { date: date, time: time } } },
    { new: true }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }
  const response = {
    data: { message: "Your tour schedule have been successfully set." },
  };

  await Idempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
};

/**
 *Proposes a reschedule to tour date and time
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
  const id = req.params.id as string;

  const { date, time } = req.body;

  const idempotencyKey = EnsureIdempotency(req, res);

  await Schedule.create({
    tourId: id,
    propose: { date: date, time: time },
  });

  const response = {
    data: {
      message:
        "Your tour reschedule proposal have been set. We will inform you on the status of the proposal shortly.",
    },
  };

  await Idempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
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

  const scheduleId = req.params.rescheduleId;

  const schedule = await Schedule.findById({ _id: scheduleId });

  if (!schedule) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or already processed."
    );
  }

  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        schedule: {
          date: schedule.propose.date,
          time: schedule.propose.time,
        },
      },
    },
    { new: true }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${id}`
    );
  }

  await schedule.deleteOne();

  // await Notify(); // Send push notification to Customer and Realtor

  return res.status(HttpStatusCode.MODIFIED).json({ data: { message: null } });
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
  const scheduleId = req.params.rescheduleId as string;

  const schedule = await Schedule.findByIdAndDelete({
    _id: scheduleId,
  });

  if (!schedule) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or already processed."
    );
  }

  // await Notify();  // Send push notification to Customer or Realtor

  return res.status(HttpStatusCode.MODIFIED).json({ data: { message: null } });
};

/**
 * Create a new tour in collection.
 */
const createTourCollection = AsyncCatch(createTour, Retry.ExponentialBackoff);

/**
 * Retrieve collection of tours.
 */
const retrieveTourCollection = AsyncCatch(getTours, Retry.LinearJitterBackoff);

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
const acceptProposedTourRequest = AsyncCatch(
  acceptTourRequest,
  Retry.LinearBackoff
);

/**
 * reject tour realtor request
 */
const rejectProposedTourRequest = AsyncCatch(
  rejectTourRequest,
  Retry.LinearBackoff
);

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
  createTourCollection,
  retrieveTourCollection,
  retrieveTourItem,
  updateTourItem,
  completeTourItem,
  cancelTourItem,
  reopenTourItem,
  retrieveAvailableRealtors,
  selectTourRealtor,
  acceptProposedTourRequest,
  rejectProposedTourRequest,
  scheduleTourItem,
  rescheduleTourItem,
  acceptProposedTourReschedule,
  rejectProposedTourReschedule,
};
