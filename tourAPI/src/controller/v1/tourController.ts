import AsyncCatch from "../../utils/asynCatch";
import { NextFunction, Request, Response } from "express";
import Features from "../../utils/feature";
import HttpClient from "../../../httpClient";
import HttpStatusCode from "../../enum/httpStatusCode";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import DuplicateTransactionError from "../../error/duplicateTransactionError";
import PaymentEventPayloadError from "../../error/paymentEventPayloadError";
import Retry from "../../utils/retry";
import Tour from "../../model/tourModel";
import TourIdempotency from "../../model/tourIdempotencyModel";
import TourRealtor from "../../model/tourRealtorModel";
import TourSchedule from "../../model/tourScheduleModel";

const createTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { customer, listings, transactionRef } = req.body;

  if (!customer || !listings! || transactionRef) {
    throw new PaymentEventPayloadError("Invalid request body data structure");
  }

  const verifyOperationIdempotency = await TourIdempotency.findOne({
    key: transactionRef,
  });

  if (verifyOperationIdempotency) {
    throw new DuplicateTransactionError(
      `Duplicate transaction reference detected: ${transactionRef}`
    );
  }

  await Tour.create({ customer, listings });

  const response = { data: "Created" };

  await TourIdempotency.create({
    key: transactionRef,
    response: response,
  });

  // await Mail(); // Send mail to customer confirming tour creation success

  // await Notify(); // Send push notification to customer to schedule tour and select realtor

  return res.status(HttpStatusCode.CREATED).json(response);
};

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

const replaceTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tour = await Tour.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

const updateTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  const verifyOperationIdempotency = await TourIdempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.MODIFIED)
      .json(verifyOperationIdempotency.response);
  }

  const tour = await Tour.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  const response = { data: "Modified" };

  await TourIdempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.MODIFIED).json(response);
};

const deleteTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tour = await Tour.findByIdAndDelete({ _id: req.params.id });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  return res.status(HttpStatusCode.MODIFIED).json(null);
};

const completeTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tour = await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { status: "completed", isClosed: true } },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  // await Notify() // Send push notification confirming completion and requesting a review

  return res.status(HttpStatusCode.OK).json(null);
};

const cancelTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tour = await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { status: "cancelled", isClosed: true } },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  // await Notify() // Send push notification confirming cancellation and requesting a reason

  return res.status(HttpStatusCode.OK).json(null);
};

const reopenTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tour = await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { status: "pending", isClosed: false } },
    {
      new: true,
    }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No cancelled tour found for id: ${req.params.id}`
    );
  }

  // await Notify() // Send push notification confirming reopening

  return res
    .status(HttpStatusCode.OK)
    .json({ data: "Your tour has been successfully reopened" });
};

const getRealtors = async (
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

  const httpClient = new HttpClient(
    `www.ahia.com/iam/realtors?status=available&location=${tour.location}`,
    {
      "Content-Type": "application/json",
    }
  );

  const realtors = await httpClient.Get();

  return res.status(HttpStatusCode.OK).json({ data: realtors });
};

const selectRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const { id, email } = req.query;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  const verifyOperationIdempotency = await TourIdempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.CREATED)
      .json(verifyOperationIdempotency.response);
  }

  await TourRealtor.create({
    tourId: tourId,
    realtor: { id: id, email: email },
  });

  // await Notify() // Send push notification to realtor about tour request

  const response = {
    data: "Realtor has been notified of your request. Realtor's confirmation status will be communicated to you accordingly.",
  };

  await TourIdempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
};

const acceptTourRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const request = await TourRealtor.findOne({ tourId: req.params.id });

  if (!request) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No realtor request found for tour: ${req.params.id}`
    );
  }

  const tour = await Tour.findById({ _id: req.params.id });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  tour.realtor = request.realtor;

  await tour.save();

  await request.deleteOne();

  // await Notify() // Send realtor's acceptance push notification to customer

  return res.status(HttpStatusCode.MODIFIED).json({
    data: `Congratulations, you have been added to tour: ${req.params.id}`,
  });
};

const rejectTourRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const request = await TourRealtor.findOne({ tourId: req.params.id });

  if (!request) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No realtor request found for tour: ${req.params.id}`
    );
  }

  const tour = await Tour.findById({ _id: req.params.id });

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }

  await request.deleteOne();

  // await Notify() // Send realtor's rejection push notification to customer

  return res.status(HttpStatusCode.MODIFIED).json({
    data: `Successfully rejected realtor request for tour: ${req.params.id}`,
  });
};

const scheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const { date, time } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  const verifyOperationIdempotency = await TourIdempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.CREATED)
      .json(verifyOperationIdempotency.response);
  }

  const tour = await Tour.findByIdAndUpdate(
    { _id: tourId },
    { $set: { schedule: { date: date, time: time } } },
    { new: true }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }
  const response = {
    data: "Your tour schedule have been successfully set.",
  };

  await TourIdempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
};

const rescheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const { date, time } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  const verifyOperationIdempotency = await TourIdempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.CREATED)
      .json(verifyOperationIdempotency.response);
  }

  await TourSchedule.create({
    tourId: tourId,
    propose: { date: date, time: time },
  });

  const response = {
    data: "Your tour reschedule proposal have been set. We will inform you on the status of the proposal shortly.",
  };

  await TourIdempotency.create({
    key: idempotencyKey,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
};

const acceptTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const tourScheduleId = req.params.rescheduleId;

  const schedule = await TourSchedule.findById({ _id: tourScheduleId });

  if (!schedule) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or already processed."
    );
  }

  const tour = await Tour.findByIdAndUpdate(
    { _id: tourId },
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
      `No tour found for id: ${req.params.id}`
    );
  }

  await schedule.deleteOne();

  // await Notify(); // Send push notification to Customer and Realtor

  return res.status(HttpStatusCode.MODIFIED).json();
};

const rejectTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourScheduleId = req.params.rescheduleId;

  const schedule = await TourSchedule.findById({ _id: tourScheduleId });

  if (!schedule) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or already processed."
    );
  }

  await schedule.deleteOne();

  // await Notify();  // Send push notification to Customer or Realtor

  return res.status(HttpStatusCode.MODIFIED).json();
};

/**
 * Handle not allowed operations
 */
const operationNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return res.status(HttpStatusCode.METHOD_NOT_ALLOWED).json({
    message: "operation not allowed",
  });
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
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncCatch(replaceTour, Retry.ExponentialBackoff);

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
  replaceTourItem,
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
  operationNotAllowed,
};
