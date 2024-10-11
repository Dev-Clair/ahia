import * as Sentry from "@sentry/node";
import { randomUUID } from "node:crypto";
import Cache from "../utils/cache";
import Geocode from "../utils/geocode";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import { NextFunction, Request, Response } from "express";
import LocationService from "../service/locationService";

/**
 * Retrieves a location's coordinates using google map geocode API
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const getLocationGeoCoordinates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const place = (req.query.location as string) ?? "";

    if (!place.trim()) {
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: "Location is required",
        },
      });
    }

    // Search and retrieve location coordinates from cache
    const cacheKey = place.trim().toLowerCase();

    const cache = Cache.LruCache;

    let location = cache.get(cacheKey);

    if (location) {
      // Attach cached geocoordinates to the req object
      req.geoCoordinates = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        radius: parseInt(req.query.radius as string, 10),
      };

      delete req.query.location;

      return next();
    }

    // Search and retrieve location coordinates from the database
    location = await LocationService.Create().findByName(place.trim());

    if (location) {
      // Attach retrieved geocoordinates to the req object
      req.geoCoordinates = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
      };

      // Set coordinates in cache for future requests
      cache.set(cacheKey, req.geoCoordinates);

      req.geoCoordinates.radius = parseInt(req.query.radius as string, 10);

      delete req.query.location;

      return next();
    }

    // Retrieve coordinates from google map API geocode service
    const geocodeAPIResponse = await Geocode.getGeoCoordinates(place.trim());

    const { statusCode, body } = geocodeAPIResponse;

    if (statusCode !== HttpCode.OK || !body.data.results.length) {
      Sentry.captureException({
        message: "Failed to fetch geocoordinates from the Geocode API Service",
        response: geocodeAPIResponse,
      });

      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        error: {
          name: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Geo coordinates retrieval for location ${place.trim()} failed`,
        },
      });
    }

    const coordinates = body.data.results[0].geometry.location;

    // Save the new location to the database
    await LocationService.Create().save(
      { key: randomUUID() },
      {
        name: place.trim(),
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      }
    );

    // Attach geocoordinates to the req object
    req.geoCoordinates = {
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    // Set coordinates in cache for future requests
    cache.set(cacheKey, req.geoCoordinates);

    req.geoCoordinates.radius = parseInt(req.query.radius as string, 10);

    delete req.query.location;

    next();
  } catch (error: any) {
    Sentry.captureException(error);

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
  getLocationGeoCoordinates,
  getGeoCoordinateAddress,
  parseUserGeoCoordinates,
};
