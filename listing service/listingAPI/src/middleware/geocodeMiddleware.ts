import * as Sentry from "@sentry/node";
import Geocode from "../utils/geocode";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import { NextFunction, Request, Response } from "express";

/**
 * Retrieves an address' coordinates using google map geocode API
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const getAddressGeoCoordinates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { street, city, state, zip } = req.body.address || {};

    if (!street || !city || !state)
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: "Incomplete address information provided",
        },
      });

    const address = `${street}, ${city}, ${state}, ${zip}`;

    const response = await Geocode.getGeoCoordinates(address);

    const { statusCode, body } = response;

    if (statusCode !== HttpCode.OK) {
      Sentry.captureException({ response });

      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        error: {
          name: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Geo coordinates retrieval for address ${address} failed`,
        },
      });
    }

    const coordinates = body.data.results[0].geometry.location;

    (req as Request).geoCoordinates = {
      lng: coordinates.lng,
      lat: coordinates.lat,
    };

    next();
  } catch (error: any) {
    Sentry.captureException({ error });

    next(error);
  }
};

/**
 * Retrieves a locations's address using google map places API
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const getGeoCoordinateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lat, lng } = req.query as Record<string, any>;

    const geoCoordinates = `${lat},${lng}`;

    const response = await Geocode.getAddress(geoCoordinates);

    const { statusCode, body } = response;

    if (statusCode !== HttpCode.OK) {
      Sentry.captureException({ response });

      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        error: {
          name: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Address retrieval for geo coordinates ${geoCoordinates} failed`,
        },
      });
    }

    (req as Request).address = body.data.results[0].formatted_address;

    next();
  } catch (error: any) {
    Sentry.captureException({ error });

    next(error);
  }
};

/**
 * Parse and verifies a user's geoCoordinates from the navigator geolocation API
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const parseUserGeoCoordinates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { lat, lng } = req.query as Record<string, any>;

  const parsedLat = parseInt(lat, 10);

  const parsedLng = parseInt(lng, 10);

  const verifyGeoCoordinates = Geocode.verifyGeoCoordinates([
    parsedLat,
    parsedLng,
  ]);

  if (!verifyGeoCoordinates) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: "Provided geo coordinates are out of the valid range",
      },
    });
  }

  next();
};

export default {
  getAddressGeoCoordinates,
  getGeoCoordinateAddress,
  parseUserGeoCoordinates,
};
