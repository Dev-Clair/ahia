import { NextFunction, Request, Response } from "express";
import HTTPClient from "../../utils/httpClient";
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
import TourRequest from "../../model/tourRequestModel";

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
      const response = { data: "Created" };

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
    const projection = {
      // name: 1,
      realtor: 1,
      customer: 1,
      listingsId: 1,
      // listing:1,
      // location:1,
      // schedule: 1,
      status: 1,
    };

    const { data, pagination } = await Features(Tour, {}, req, projection);

    console.log(data);

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

      return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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
      const response = { data: "Modified" };

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

const deleteTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndDelete({ _id: req.params.id })
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

const completeTour = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { status: "completed", isClosed: true } },
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
        .json({ data: "Your tour has been successfully completed" });
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
    { $set: { status: "cancelled", isClosed: true } },
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
        .json({ data: "Your tour has been successfully cancelled" });
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
    { $set: { status: "pending", isClosed: false } },
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
        .json({ data: "Your tour has been successfully reopened" });
    })
    .catch((err) => next(err));
};

const getRealtors = async (
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

      const httpClient = new HTTPClient(
        `www.ahia.com/iam/realtors?status=available&location=${tour.location}`,
        {
          "Content-Type": "application/json",
        }
      );

      const realtors = httpClient.Get();

      return res.status(HttpStatusCode.OK).json({ data: realtors });
    })
    .catch((err) => next(err));
};

const selectRealtor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const { realtorId, realtorEmail } = req.query;

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

  await TourRequest.create({
    tourId: tourId,
    realtor: { id: realtorId, email: realtorEmail },
  })
    .then(async (request) => {
      // Notify realtor of request

      const response = {
        data: "Realtor has been notified of your request. Realtor's confirmation status will be communicated to you accordingly.",
      };

      await TourIdempotency.create({
        key: idempotencyKey,
        response: response,
      });

      return res.status(HttpStatusCode.CREATED).json(response);
    })
    .catch((err) => next(err));
};

const acceptTourRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await TourRequest.findOne({ tourId: req.params.id })
    .then(async (request) => {
      if (!request) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No realtor request found for tour: ${req.params.id}`
        );
      }

      await Tour.findById({ _id: req.params.id })
        .then(async (tour) => {
          if (!tour) {
            throw new NotFoundError(
              HttpStatusCode.NOT_FOUND,
              `No tour found for id: ${req.params.id}`
            );
          }

          tour.realtor = request.realtor;

          await tour.save();

          await request.deleteOne({ id: request.tourId });

          await request.save();

          // Notify customer of realtor's acceptance

          return res.status(HttpStatusCode.MODIFIED).json({
            data: `Congratulations, you have been added to tour: ${req.params.id}`,
          });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

const rejectTourRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await TourRequest.findOne({ tourId: req.params.id })
    .then(async (request) => {
      if (!request) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No realtor request found for tour: ${req.params.id}`
        );
      }

      await Tour.findById({ _id: req.params.id })
        .then(async (tour) => {
          if (!tour) {
            throw new NotFoundError(
              HttpStatusCode.NOT_FOUND,
              `No tour found for id: ${req.params.id}`
            );
          }

          await request.deleteOne({ id: request.tourId });

          await request.save();

          // Notify customer of realtor's rejection

          return res.status(HttpStatusCode.MODIFIED).json({
            data: `Successfully rejected realtor request for tour: ${req.params.id}`,
          });
        })
        .catch((err) => next(err));
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
    { $set: { schedule: { date: date, time: time } } },
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
        data: "Your tour schedule have been successfully set.",
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

  await TourSchedule.create({
    tourId: tourId,
    propose: { date: date, time: time },
  })
    .then(async (schedule) => {
      const response = {
        data: "Your tour reschedule proposal have been set. We will inform you on the status of the proposal shortly.",
      };

      await TourIdempotency.create({
        key: idempotencyKey,
        response: response,
      });

      return res.status(HttpStatusCode.CREATED).json(response);
    })
    .catch((err) => next(err));
};

const acceptTourReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const tourId = req.params.id;

  const tourScheduleId = req.params.rescheduleId;

  await TourSchedule.findByIdAndUpdate(
    { _id: tourScheduleId },
    { $set: { status: "accepted" } },
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
          $set: {
            schedule: {
              date: schedule.propose.date,
              time: schedule.propose.time,
            },
          },
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
    { $set: { status: "rejected" } },
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
  Retry.LinearJitterBackoff
);

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncErrorWrapper(getTour, Retry.LinearJitterBackoff);

/**
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncErrorWrapper(
  replaceTour,
  Retry.ExponentialBackoff
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
 * retrieve realtors based on availability and tour location
 */
const retrieveAvailableRealtors = AsyncErrorWrapper(getRealtors);

/**
 * select a realtor from collection based on availability and tour location
 */
const selectTourRealtor = AsyncErrorWrapper(selectRealtor);

/**
 * accept tour realtor request
 */
const acceptProposedTourRequest = AsyncErrorWrapper(
  acceptTourRequest,
  Retry.LinearBackoff
);

/**
 * reject tour realtor request
 */
const rejectProposedTourRequest = AsyncErrorWrapper(
  rejectTourRequest,
  Retry.LinearBackoff
);

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
const acceptProposedTourReschedule = AsyncErrorWrapper(acceptTourReschedule);

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
