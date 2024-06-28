import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import NotFoundError from "../../error/notfoundError";
import PaymentEventPayloadError from "../../error/paymentEventPayloadError";
import DuplicateTransactionError from "../../error/duplicateTransactionError";
import TourModel from "../../model/tourModel";
import TourIdempotencyModel from "../../model/tourIdempotencyModel";
import TourScheduleModel from "../../model/tourScheduleModel";
import AsyncErrorWrapper from "../../utils/asyncErrorWrapper/asyncErrorWrapper";
import RetryHandler from "../../utils/retryHandler/retryHandler";
import NotifyUser from "../../utils/notificationHandler/notificationHandler";

const createTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  const {
    customerId: customerId,
    listingIds: listingIds,
    transactionRef: transactionRef,
  } = req.body;

  if (!transactionRef || !customerId || !listingIds) {
    throw new PaymentEventPayloadError("Invalid request body data structure");
  }

  await TourIdempotencyModel.findOne({ key: transactionRef })
    .then((verifyOperationIdempotency) => {
      if (verifyOperationIdempotency) {
        // notificationHandler.notifyAdmin();

        throw new DuplicateTransactionError(
          `Duplicate event detected: ${transactionRef}`
        );
      }
    })
    .catch((err) => next(err));

  await TourModel.create(req.body)
    .then(async (tour) => {
      const response = { message: "Created", data: tour };

      await TourIdempotencyModel.create({
        key: transactionRef,
        response: response,
      });

      // await notifyUser();

      return res.status(201).json(response);
    })
    .catch((err) => next(err));
};

const getTours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  await TourModel.find()
    .then((tours) => {
      if (!tours) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tours found for query: ${req.query.q}`
        );
      }

      return res.status(HttpStatusCode.OK).json({
        count: tours.length,
        data: tours,
      });
    })
    .catch((err) => next(err));
};

const getTourSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  await TourModel.find({
    // $text: { $search: req.query.q, $caseSensitive: false },
  })
    .then((tours) => {
      if (!tours) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tours found for query: ${req.query.q}`
        );
      }

      return res.status(HttpStatusCode.OK).json({
        count: tours.length,
        data: tours,
      });
    })
    .catch((err) => next(err));
};

const getTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  await TourModel.findById({ _id: req.params.id })
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
): Promise<typeof Response | void> => {
  await TourModel.findOneAndReplace({ id: req.params.id }, req.body, {
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
): Promise<typeof Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  await TourIdempotencyModel.findOne({
    key: idempotencyKey,
  })
    .then((verifyOperationIdempotency) => {
      if (verifyOperationIdempotency) {
        res.status(HttpStatusCode.OK).json(verifyOperationIdempotency.response);
      }
    })
    .catch((err) => next(err));

  await TourModel.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
  })
    .then(async (tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }

      await TourIdempotencyModel.create({
        key: idempotencyKey,
        response: null,
      });

      return res.status(HttpStatusCode.MODIFIED).json(null);
    })
    .catch((err) => next(err));
};

const completeTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  await TourModel.findOneAndUpdate(
    { id: req.params.id },
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
): Promise<typeof Response | void> => {
  await TourModel.findOneAndUpdate(
    { id: req.params.id },
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
): Promise<typeof Response | void> => {
  await TourModel.findOneAndUpdate(
    { id: req.params.id, status: "cancelled" },
    { isClosed: false },
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
): Promise<typeof Response | void> => {
  await TourModel.findOneAndUpdate({ id: req.params.id })
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
): Promise<typeof Response | void> => {
  const tourId = req.params.id;

  const { scheduledDate, scheduledTime } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  await TourIdempotencyModel.findOne({
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

  await TourModel.findByIdAndUpdate(
    { id: tourId },
    { scheduledDate: scheduledDate, scheduledTime: scheduledTime },
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

      await TourIdempotencyModel.create({
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
): Promise<typeof Response | void> => {
  const tourId = req.params.id;

  const { proposedDate, proposedTime } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  await TourIdempotencyModel.findOne({
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

  await TourModel.findById({ id: tourId })
    .then((tour) => {
      if (!tour) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No tour found for id: ${req.params.id}`
        );
      }
    })
    .catch((err) => next(err));

  await TourScheduleModel.create({ tourId, proposedDate, proposedTime })
    .then(async (schedule) => {
      const response = {
        message:
          "your tour reschedule proposal have been set. We will inform you on the status of the proposal shortly.",
        data: schedule,
      };

      await TourIdempotencyModel.create({
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
): Promise<typeof Response | void> => {
  const tourId = req.params.id;

  const tourScheduleId = req.params.rescheduleId;

  await TourScheduleModel.findByIdAndUpdate(
    { id: tourScheduleId },
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

      await TourModel.findByIdAndUpdate(
        { id: tourId },
        {
          scheduledDate: schedule.proposedDate,
          scheduledTime: schedule.proposedTime,
        },
        { new: true }
      )
        .then((tour) => {
          if (!tour) {
            throw new NotFoundError(
              HttpStatusCode.NOT_FOUND,
              `No tour found for id: ${req.params.id}`
            );
          }

          // await notifyUser();
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

const rejectTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  const tourScheduleId = req.params.rescheduleId;

  await TourScheduleModel.findByIdAndUpdate(
    { id: tourScheduleId },
    { status: "rejected" },
    { new: true }
  )
    .then((schedule) => {
      if (!schedule || schedule.status !== "pending") {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          "schedule not found or already processed."
        );
      }

      // await notifyUser();
    })
    .catch((err) => next(err));
};

/**
 * Create a new tour in collection.
 */
const createTourCollection = AsyncErrorWrapper(
  createTour,
  RetryHandler.ExponentialRetry
  // { retries: 3, factor: 2, minTimeout: 10000 }
);

/**
 * Retrieve collection of tours.
 */
const retrieveTourCollection = AsyncErrorWrapper(
  getTours,
  RetryHandler.LinearJitterRetry,
  {
    retries: 2,
    jitterFactor: 1000,
    minTimeout: 5000,
  }
);

/**
 * Retrieve collection of tours based on search parameter.
 */
const retrieveTourSearch = AsyncErrorWrapper(
  getTourSearch,
  RetryHandler.LinearJitterRetry,
  {
    retries: 2,
    jitterFactor: 1000,
    minTimeout: 5000,
  }
);

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncErrorWrapper(
  getTour,
  RetryHandler.LinearJitterRetry,
  {
    retries: 3,
    jitterFactor: 1000,
    minTimeout: 7500,
  }
);

/**
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncErrorWrapper(
  replaceTour,
  RetryHandler.ExponentialRetry
  // { retries: 3, factor: 2, minTimeout: 10000 }
);

/**
 * Updates a tour item using its :id.
 */
const updateTourItem = AsyncErrorWrapper(updateTour, RetryHandler.LinearRetry);

/**
 * Deletes a tour item using its :id.
 */
const deleteTourItem = AsyncErrorWrapper(deleteTour, RetryHandler.LinearRetry);

/**
 * Complete a tour item using its :id.
 */
const completeTourItem = AsyncErrorWrapper(
  completeTour,
  RetryHandler.LinearRetry
);

/**
 * Cancels a tour item using its :id.
 */
const cancelTourItem = AsyncErrorWrapper(cancelTour, RetryHandler.LinearRetry);

/**
 * reopens a cancelled tour using its :id.
 */
const reopenTourItem = AsyncErrorWrapper(reopenTour, RetryHandler.LinearRetry);

/**
 * schedule a new tour.
 */
const scheduleTourItem = AsyncErrorWrapper(
  scheduleTour,
  RetryHandler.LinearRetry
);

/**
 * reschedules an existing tour.
 */
const rescheduleTourItem = AsyncErrorWrapper(
  rescheduleTour,
  RetryHandler.LinearRetry
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
  return res.status(405).json({
    message: "operation not allowed",
  });
};

export default {
  createTourCollection,
  retrieveTourCollection,
  retrieveTourSearch,
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
