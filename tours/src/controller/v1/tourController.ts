import { NextFunction, Request, Response } from "express";
import Tour from "../../model/tourModel";

/**
 * Retrieve collection of tours based on search parameter.
 */
const retrieveToursSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tours = await Tour.find({
      //   $text: { $search: req.query.q, $caseSensitive: false },
    });

    if (!tours) {
      return res
        .status(404)
        .json({ message: `No tours found for query: ${req.query.q}` });
    }

    return res.status(200).json({
      count: tours.length,
      tours: tours,
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * Retrieve a tour item using its :id.
 */
const retrieveTourItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tour = await Tour.findById({ _id: req.params.id });

    if (!tour) {
      return res
        .status(404)
        .json({ message: `No item found for tour id: ${req.params.id}` });
    }

    return res.status(200).json({ tour: tour });
  } catch (err: any) {
    next(err);
  }
};

/**
 * Replace a tour item using its :id.
 */
const replaceTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findOneAndReplace(
      { _id: req.params._id },
      req.body,
      {
        new: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        message: `No item found for tour id: ${req.params.id}`,
      });
    }

    return res.status(204).json(null);
  } catch (err: any) {
    next(err);
  }
};

/**
 * Updates a tour item using its :id.
 */
const updateTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findOneAndUpdate(
      { _id: req.params._id },
      req.body,
      {
        new: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        message: `No item found for tour id: ${req.params.id}`,
      });
    }

    return res.status(204).json(null);
  } catch (err: any) {
    next(err);
  }
};

/**
 * Complete a tour item using its :id.
 */
const completeTour = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tour = await Tour.findOneAndUpdate(
      { _id: req.params._id },
      { status: "completed" },
      {
        new: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        message: `No item found for tour id: ${req.params.id}`,
      });
    }

    return res.status(204).json(null);
  } catch (err: any) {
    next(err);
  }
};

/**
 * Cancels a tour item using its :id.
 */
const cancelTour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tour = await Tour.findOneAndUpdate(
      { _id: req.params._id },
      { status: "cancelled" },
      {
        new: true,
      }
    );

    if (!tour) {
      return res.status(404).json({
        message: `No item found for tour id: ${req.params.id}`,
      });
    }

    return res.status(204).json(null);
  } catch (err: any) {
    next(err);
  }
};

/**
 * Handle not allowed operations
 */
const operationNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(405).json({
    message: "operation not allowed",
  });
};

export default {
  retrieveToursSearch,
  retrieveTourItem,
  replaceTour,
  updateTour,
  completeTour,
  cancelTour,
  operationNotAllowed,
};
