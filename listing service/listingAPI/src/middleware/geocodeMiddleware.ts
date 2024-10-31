import * as Sentry from "@sentry/node";
import { randomUUID } from "node:crypto";
import Cache from "../utils/cache";
import Geocode from "../utils/geocode";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import InternalServerError from "../error/internalserverError";
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
): Promise<void | Response<any, Record<string, any>>> => {
  try {
    const place = req.params.location as string;

    if (!place.trim()) {
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: "Location is required",
        },
      });
    }

    // Search and retrieve location coordinates from cache if available
    const cacheKey = place.trim().toLowerCase();

    const cache = Cache.LruCache;

    let location = cache.get(cacheKey);

    if (location) {
      // Attach cached coordinates to the req object for downstream handler use
      req.geoCoordinates = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        radius: parseInt(req.query?.radius as string, 10) ?? 10,
      };

      delete req.query.location;

      return next();
    }

    // Search and retrieve location coordinates from the database
    location = await LocationService.Create().findByName(place.trim());

    if (location) {
      // Attach retrieved coordinates to the req object for downstream handler use
      req.geoCoordinates = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
      };

      // Set coordinates in cache for future requests
      cache.set(cacheKey, req.geoCoordinates);

      req.geoCoordinates.radius =
        parseInt(req.query?.radius as string, 10) ?? 10;

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

      throw new InternalServerError(
        false,
        `Geocoordinates retrieval for location ${place.trim()} failed`
      );
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

    // Attach coordinates to the req object for downstream handler use
    req.geoCoordinates = {
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    // Set coordinates in cache for future requests
    cache.set(cacheKey, req.geoCoordinates);

    req.geoCoordinates.radius = parseInt(req.query?.radius as string, 10) ?? 10;

    delete req.query.location;

    next();
  } catch (error: any) {
    Sentry.captureException(error);

    return next(error);
  }
};

/**
 * Retrieves a locations's address using google map places API
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const getLocationAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lng } = req.query as Record<string, any>;

    const geoCoordinates = `${lat},${lng}`;

    const response = await Geocode.getAddress(geoCoordinates);

    const { statusCode, body } = response;

    if (statusCode !== HttpCode.OK) {
      Sentry.captureException({ response });

      throw new InternalServerError(
        false,
        `Address retrieval for geocoordinates: ${geoCoordinates} failed`
      );
    }

    (req as Request).address = body.data.results[0].formatted_address;

    delete req.query.lat;

    delete req.query.lng;

    next();
  } catch (error: any) {
    Sentry.captureException({ error });

    return next(error);
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
): Promise<Response<any, Record<string, any>> | undefined> => {
  const { lat, lng } = req.query as Record<string, any>;

  // Check if coordinates (latitude and longitude) are present
  if (!lat || !lng) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message:
          "Unable to proceed without geolocation data. Please enable location services",
      },
    });
  }

  // Parse and verify the coordinates
  const parsedLat = parseFloat(lat);

  const parsedLng = parseFloat(lng);

  // Validate the parsed coordinates
  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message:
          "Invalid geocoordinates: 'lat' and 'lng' must be valid numbers",
      },
    });
  }

  // Ensure coordinates fall within valid range
  const verifyGeoCoordinates = Geocode.verifyGeoCoordinates([
    parsedLat,
    parsedLng,
  ]);

  if (!verifyGeoCoordinates) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: "Provided geocoordinates are out of the valid range",
      },
    });
  }

  // Attach parsed coordinates to the request object for downstream handler use
  req.geoCoordinates = {
    lat: parsedLat,
    lng: parsedLng,
    distance: parseInt(req.query?.distance as string, 10) ?? 5000,
    radius: parseInt(req.query?.radius as string, 10) ?? 10,
  };

  delete req.query.lat;

  delete req.query.lng;

  delete req.query?.distance;

  delete req.query?.radius;

  next();
};

export default {
  getLocationGeoCoordinates,
  getLocationAddress,
  parseUserGeoCoordinates,
};
