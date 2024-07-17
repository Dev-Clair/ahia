import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import NotFoundError from "../../error/notfoundError";
import PaymentEventPayloadError from "../../error/paymentEventPayloadError";
import DuplicateTransactionError from "../../error/duplicateTransactionError";
import Tour from "../../model/tourModel";
import TourIdempotency from "../../model/tourIdempotencyModel";
import TourSchedule from "../../model/tourScheduleModel";
import AsyncErrorWrapper from "../../utils/asyncErrorWrapper";
import Retry from "../../utils/retry";
import Notify from "../../utils/notify";
import Features from "../../utils/feature";

const createTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const {
    customerId: customerId,
    listingIds: listingIds,
    transactionRef: transactionRef,
  } = req.body;

  if (!transactionRef || !customerId || !listingIds) {
    throw new PaymentEventPayloadError("Invalid request body data structure");
  }

  await TourIdempotency.findOne({ key: transactionRef })
    .then((verifyOperationIdempotency) => {
      if (verifyOperationIdempotency) {
        // Notify(); // Admin

        throw new DuplicateTransactionError(
          `Duplicate transaction reference detected: ${transactionRef}`
        );
      }
    })
    .catch((err) => next(err));

  await Tour.create(req.body)
    .then(async (tour) => {
      const response = { message: "Created" };

      await TourIdempotency.create({
        key: transactionRef,
        response: response,
      });

      // await Notify(); // Customer

      return res.status(HttpStatusCode.CREATED).json(response);
    })
    .catch((err) => next(err));
};

const getTours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query.search;

    const searchQuery = {
      $text: query ? { $search: query as string, $caseSensitive: false } : {},
    };

    const projection = "-__v -customer.email -realtor.email createdAt";

    const { data, pagination } = await Features(
      Tour,
      searchQuery,
      req,
      projection
    );

    return res.status(HttpStatusCode.OK).json({
      data: data,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      page: pagination.page,
      links: pagination.links,
    });
  } catch (err) {
    return next(err);
  }
};

const getTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findById({ _id: req.params.id })
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      return res.status(HttpStatusCode.OK).json({ data: tour });
    })
    .catch((err) => next(err));
};

const replaceTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  })
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      return res.status(HttpStatusCode.MODIFIED).json(null);
    })
    .catch((err) => next(err));
};

const updateTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  await TourIdempotency.findOne({
    key: idempotencyKey,
  })
    .then((verifyOperationIdempotency) => {
      if (verifyOperationIdempotency) {
        return res
          .status(HttpStatusCode.MODIFIED)
          .json(verifyOperationIdempotency.response);
      }
    })
    .catch((err) => next(err));

  await Tour.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  })
    .then(async (tour) => {
      const response = { message: "modified" };

      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      await TourIdempotency.create({
        key: idempotencyKey,
        response: response,
      });

      return res.status(HttpStatusCode.MODIFIED).json(response);
    })
    .catch((err) => next(err));
};

const completeTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { status: "completed", isClosed: true },
    {
      new: true,
    }
  )
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      return res
        .status(HttpStatusCode.OK)
        .json("Your tour has been successfully completed");
    })
    .catch((err) => next(err));
};

const cancelTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { status: "cancelled", isClosed: true },
    {
      new: true,
    }
  )
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      return res
        .status(HttpStatusCode.OK)
        .json("Your tour has been successfully cancelled");
    })
    .catch((err) => next(err));
};

const reopenTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { status: "pending", isClosed: false },
    {
      new: true,
    }
  )
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No cancelled tour found for id: ${req.params.id}`
        );
      }

      return res
        .status(HttpStatusCode.OK)
        .json("Your tour has been successfully reopened");
    })
    .catch((err) => next(err));
};

const deleteTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndUpdate({ _id: req.params.id })
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      return res.status(HttpStatusCode.MODIFIED).json(null);
    })
    .catch((err) => next(err));
};

const scheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const { date, time } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  await TourIdempotency.findOne({
    key: idempotencyKey,
  })
    .then((verifyOperationIdempotency) => {
      if (verifyOperationIdempotency) {
        res
          .status(HttpStatusCode.CREATED)
          .json(verifyOperationIdempotency.response);
      }
    })
    .catch((err) => next(err));

  await Tour.findByIdAndUpdate(
    { _id: tourId },
    { scheduledDate: date, scheduledTime: time },
    { new: true }
  )
    .then(async (tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }
      const response = {
        message:
          "your tour schedule have been set. A realtor will be assigned to you shortly based on your schedule date and time.",
        data: tour,
      };

      await TourIdempotency.create({
        key: idempotencyKey,
        response: response,
      });

      return res.status(HttpStatusCode.CREATED).json(response);
    })
    .catch((err) => next(err));
};

const rescheduleTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const { date, time } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  await TourIdempotency.findOne({
    key: idempotencyKey,
  })
    .then((verifyOperationIdempotency) => {
      if (verifyOperationIdempotency) {
        res
          .status(HttpStatusCode.CREATED)
          .json(verifyOperationIdempotency.response);
      }
    })
    .catch((err) => next(err));

  await Tour.findById({ _id: tourId })
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }
    })
    .catch((err) => next(err));

  await TourSchedule.create({
    tourId: tourId,
    proposedDate: date,
    proposedTime: time,
  })
    .then(async (schedule) => {
      const response = {
        message:
          "your tour reschedule proposal have been set. We will inform you on the status of the proposal shortly.",
        data: schedule,
      };

      await TourIdempotency.create({
        key: idempotencyKey,
        response: response,
      });

      return res.status(HttpStatusCode.CREATED).json(response);
    })
    .catch((err) => next(err));
};

const acceptTourRechedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const tourScheduleId = req.params.rescheduleId;

  await TourSchedule.findByIdAndUpdate(
    { _id: tourScheduleId },
    { status: "accepted" },
    { new: true }
  )
    .then(async (schedule) => {
      if (!schedule || schedule.status !== "pending") {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          "schedule not found or already processed."
        );
      }

      await Tour.findByIdAndUpdate(
        { _id: tourId },
        {
          scheduledDate: schedule.proposedDate,
          scheduledTime: schedule.proposedTime,
        },
        { new: true }
      )
        .then(async (tour) => {
          if (!tour) {
            throw new NotFoundError(
              HttpStatusCode.NOT_FOUND,
              `No tour found for id: ${req.params.id}`
            );
          }

          // await Notify(); // Customer && Realtor
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

const rejectTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourScheduleId = req.params.rescheduleId;

  await TourSchedule.findByIdAndUpdate(
    { _id: tourScheduleId },
    { status: "rejected" },
    { new: true }
  )
    .then(async (schedule) => {
      if (!schedule || schedule.status !== "pending") {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          "schedule not found or already processed."
        );
      }

      // await Notify();  // Customer || Realtor
    })
    .catch((err) => next(err));
};

/**
 * Create a new tour in collection.
 */
const createTourCollection = AsyncErrorWrapper(
  createTour,
  Retry.ExponentialBackoff
);

/**
 * Retrieve collection of tours.
 */
const retrieveTourCollection = AsyncErrorWrapper(
  getTours,
  Retry.LinearJitterBackoff,
  {
    retries: 2,
    minTimeout: 2500,
    jitterFactor: 1000,
  }
);

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncErrorWrapper(getTour, Retry.LinearJitterBackoff, {
  retries: 2,
  minTimeout: 2500,
  jitterFactor: 1000,
});

/**
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncErrorWrapper(
  replaceTour,
  Retry.ExponentialBackoff,
  { retries: 3, factor: 2, minTimeout: 10000 }
);

/**
 * Updates a tour item using its :id.
 */
const updateTourItem = AsyncErrorWrapper(updateTour, Retry.LinearBackoff);

/**
 * Deletes a tour item using its :id.
 */
const deleteTourItem = AsyncErrorWrapper(deleteTour, Retry.LinearBackoff);

/**
 * Complete a tour item using its :id.
 */
const completeTourItem = AsyncErrorWrapper(completeTour, Retry.LinearBackoff);

/**
 * Cancels a tour item using its :id.
 */
const cancelTourItem = AsyncErrorWrapper(cancelTour, Retry.LinearBackoff);

/**
 * reopens a cancelled tour using its :id.
 */
const reopenTourItem = AsyncErrorWrapper(reopenTour, Retry.LinearBackoff);

/**
 * schedule a new tour.
 */
const scheduleTourItem = AsyncErrorWrapper(scheduleTour, Retry.LinearBackoff);

/**
 * reschedules an existing tour.
 */
const rescheduleTourItem = AsyncErrorWrapper(
  rescheduleTour,
  Retry.LinearBackoff
);

/**
 * accepts proposed tour schedule.
 */
const acceptProposedTourReschedule = AsyncErrorWrapper(acceptTourRechedule);

/**
 * rejects proposed tour schedule.
 */
const rejectProposedTourReschedule = AsyncErrorWrapper(rejectTourReschedule);

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

export default {
  createTourCollection,
  retrieveTourCollection,
  retrieveTourItem,
  replaceTourItem,
  updateTourItem,
  completeTourItem,
  cancelTourItem,
  reopenTourItem,
  scheduleTourItem,
  rescheduleTourItem,
  acceptProposedTourReschedule,
  rejectProposedTourReschedule,
  operationNotAllowed,
};
