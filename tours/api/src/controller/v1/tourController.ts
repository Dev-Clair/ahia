import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import AsyncHandler from "../../utils/asyncHandler";
import NotFoundError from "../../error/notfoundError";
import Tour from "../../model/tourModel";

/**
 * Retrieve collection of tours.
 */
const retrieveTourCollection = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.find()
      .then((tours) => {
        if (!tours) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No tours found for query: ${req.query.q}`
          );
        }

        return res.status(HttpStatusCode.OK).json({
          count: tours.length,
          tours: tours,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * Retrieve collection of tours based on search parameter.
 */
const retrieveTourSearch = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.find({
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
          tours: tours,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.findById({ _id: req.params.id })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No record found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.OK).json({ tour: tour });
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * Replace a tour item using its :id.
 */
const replaceTourItem = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.findOneAndReplace({ _id: req.params._id }, req.body, {
      new: true,
    })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No record found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.MODIFIED).json(null);
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * Updates a tour item using its :id.
 */
const updateTourItem = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.findOneAndUpdate({ _id: req.params._id }, req.body, {
      new: true,
    })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No record found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.MODIFIED).json(null);
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * Complete a tour item using its :id.
 */
const completeTourItem = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.findOneAndUpdate(
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
            `No record found for id: ${req.params.id}`
          );
        }

        return res
          .status(HttpStatusCode.OK)
          .json("Congrats! Your tour has been successfully completed");
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * Cancels a tour item using its :id.
 */
const cancelTourItem = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.findOneAndUpdate(
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
            `No record found for id: ${req.params.id}`
          );
        }

        return res
          .status(HttpStatusCode.OK)
          .json("Congrats! Your tour has been successfully cancelled");
      })
      .catch((err) => {
        next(err);
      });
  }
);

/**
 * reopens a cancelled tour using its :id.
 */
const reopenTourItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  await Tour.findOneAndUpdate(
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
    .catch((err) => {
      next(err);
    });
};

/**
 * Deletes a tour item using its :id.
 */
const deleteTourItem = AsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    await Tour.findOneAndUpdate({ _id: req.params._id })
      .then((tour) => {
        if (!tour) {
          throw new NotFoundError(
            HttpStatusCode.NOT_FOUND,
            `No record found for id: ${req.params.id}`
          );
        }

        return res.status(HttpStatusCode.MODIFIED).json(null);
      })
      .catch((err) => {
        next(err);
      });
  }
);

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
  retrieveTourCollection,
  retrieveTourSearch,
  retrieveTourItem,
  replaceTourItem,
  updateTourItem,
  completeTourItem,
  cancelTourItem,
  reopenTourItem,
  operationNotAllowed,
};
