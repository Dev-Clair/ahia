import * as Sentry from "@sentry/node";
import { randomUUID } from "node:crypto";
import Cache from "../../cache";
import Geocode from "../utils/geocode";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import IGeoCoordinates from "../interface/IGeocoordinates";
import InternalServerError from "../error/internalserverError";
import { NextFunction, Request, Response } from "express";
import PlaceService from "../service/placeService";

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
): Promise<Response | void> => {
  try {
    const place = req.params.place as string;

    if (!place.trim()) {
      return res.sendResponse(HttpCode.BAD_REQUEST, null, {
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: "Place is required",
        },
      });
    }

    // Search and retrieve coordinates from cache if available
    const cacheKey = place.trim().toLowerCase();

    let location = Cache.get(cacheKey);

    if (location) {
      // Attach cached coordinates to the req object
      req.geoCoordinates = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        radius: parseInt((req.query?.radius as string) ?? "5", 10),
      };

      delete req.query.location;

      return next();
    }

    // Search and retrieve place coordinates from the database
    location = await PlaceService.Create().findByField(place.trim());

    if (location) {
      // Attach retrieved coordinates to the req object
      req.geoCoordinates = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
      };

      // Set coordinates in cache for future requests
      Cache.set(cacheKey, req.geoCoordinates);

      req.geoCoordinates.radius = parseInt(
        (req.query?.radius as string) ?? "5",
        10
      );

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

    // Save the new place to the database
    await PlaceService.Create().save(
      {
        city: place.trim(),
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
      },
      { idempotent: { idempotent: randomUUID() } }
    );

    // Attach coordinates to the req object
    req.geoCoordinates = {
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    // Set coordinates in cache for future requests
    Cache.set(cacheKey, req.geoCoordinates);

    req.geoCoordinates.radius = parseInt(
      (req.query?.radius as string) ?? "5",
      10
    );

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

    // Attach address to the req object
    req.geoCoordinates = {
      lat: lat,
      lng: lng,
      address: body.data.results[0].formatted_address,
    } as IGeoCoordinates;

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
): Promise<Response | void> => {
  const { lat, lng } = req.query as Record<string, any>;

  // Check if coordinates (latitude and longitude) are present
  if (!lat || !lng) {
    return res.sendResponse(HttpCode.BAD_REQUEST, null, {
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
    return res.sendResponse(HttpCode.BAD_REQUEST, null, {
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
    return res.sendResponse(HttpCode.BAD_REQUEST, null, {
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: "Provided geocoordinates are out of the valid range",
      },
    });
  }

  // Attach parsed coordinates to the request object
  req.geoCoordinates = {
    lat: parsedLat,
    lng: parsedLng,
    distance: parseInt((req.query?.distance as string) ?? "1000", 10),
    // radius: parseInt((req.query?.radius as string) ?? "1", 10),
  } as IGeoCoordinates;

  delete req.query.lat;

  delete req.query.lng;

  delete req.query?.distance;

  // delete req.query?.radius;

  next();
};

export default {
  getLocationGeoCoordinates,
  getLocationAddress,
  parseUserGeoCoordinates,
};
