import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import NotFoundError from "../../error/notfoundError";
import TourModel from "../../model/tourModel";
import TourIdempotencyModel from "../../model/tourIdempotencyModel";
import TourScheduleModel from "../../model/tourScheduleModel";
import AsyncErrorWrapper from "../../utils/asyncErrorWrapper/asyncErrorWrapper";
import {
  ExponentialRetry,
  LinearJitterRetry,
} from "../../utils/retryHandler/retryHandler";

const creatTour = async (): Promise<typeof Response | void> => {};

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
  await TourModel.findOneAndReplace({ _id: req.params._id }, req.body, {
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

  const verifyOperationIdempotency = await TourIdempotencyModel.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    res.status(HttpStatusCode.OK).json(verifyOperationIdempotency.response);
  }

  await TourModel.findOneAndUpdate({ _id: req.params._id }, req.body, {
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
    { _id: req.params._id },
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
    { _id: req.params._id },
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
    { _id: req.params._id, status: "cancelled" },
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
  await TourModel.findOneAndUpdate({ _id: req.params._id })
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

  const { proposedDate, proposedTime } = req.body;

  const idempotencyKey = req.headers["idempotency-key"] as string;

  const verifyOperationIdempotency = await TourIdempotencyModel.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    res.status(HttpStatusCode.OK).json(verifyOperationIdempotency.response);
  }

  await TourModel.findById({ _id: tourId })
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
          "your availability schedule have been set. A realtor will be assigned to you shortly based on your proposed availability date and time.",
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

const acceptTourSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  const tourId = req.params.id;

  const tourScheduleId = req.params.rescheduleId;

  const schedule = await TourScheduleModel.findByIdAndUpdate(
    { _id: tourScheduleId },
    { status: "accepted" },
    { new: true }
  );

  if (!schedule || schedule.status !== "pending") {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or already processed."
    );
  }

  const tour = await TourModel.findByIdAndUpdate(
    { _id: tourId },
    {
      scheduledDate: schedule.proposedDate,
      scheduledTime: schedule.proposedTime,
    },
    { new: true }
  );

  if (!tour) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No tour found for id: ${req.params.id}`
    );
  }
};

const rejectTourSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<typeof Response | void> => {
  const tourScheduleId = req.params.rescheduleId;

  const schedule = await TourScheduleModel.findByIdAndUpdate(
    { _id: tourScheduleId },
    { status: "rejected" },
    { new: true }
  );

  if (!schedule || schedule.status !== "pending") {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      "schedule not found or already processed."
    );
  }
};

/**
 * Create a new tour in collection.
 */
const createTourCollection = AsyncErrorWrapper(creatTour);

/**
 * Retrieve collection of tours.
 */
const retrieveTourCollection = AsyncErrorWrapper(getTours, LinearJitterRetry, {
  retries: 2,
  jitterFactor: 1000,
  minTimeout: 5000,
});

/**
 * Retrieve collection of tours based on search parameter.
 */
const retrieveTourSearch = AsyncErrorWrapper(getTourSearch, LinearJitterRetry, {
  retries: 2,
  jitterFactor: 1000,
  minTimeout: 5000,
});

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncErrorWrapper(getTour, LinearJitterRetry, {
  retries: 3,
  jitterFactor: 1000,
  minTimeout: 7500,
});

/**
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncErrorWrapper(
  replaceTour,
  ExponentialRetry
  // { retries: 3, factor: 2, minTimeout: 7500 }
);

/**
 * Updates a tour item using its :id.
 */
const updateTourItem = AsyncErrorWrapper(updateTour);

/**
 * Deletes a tour item using its :id.
 */
const deleteTourItem = AsyncErrorWrapper(deleteTour);

/**
 * Complete a tour item using its :id.
 */
const completeTourItem = AsyncErrorWrapper(completeTour);

/**
 * Cancels a tour item using its :id.
 */
const cancelTourItem = AsyncErrorWrapper(cancelTour);

/**
 * reopens a cancelled tour using its :id.
 */
const reopenTourItem = AsyncErrorWrapper(reopenTour);

const scheduleTourItem = AsyncErrorWrapper(scheduleTour);

const acceptProposedTourSchedule = AsyncErrorWrapper(acceptTourSchedule);

const rejectProposedTourSchedule = AsyncErrorWrapper(rejectTourSchedule);

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
  acceptProposedTourSchedule,
  rejectProposedTourSchedule,
  operationNotAllowed,
};
