import Geocode from "../utils/geocode";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import IGeoCoordinates from "../interface/IGeocoordinates";
import { NextFunction, Request, Response } from "express";

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
    return res.sendResponse(HttpCode.BAD_REQUEST, {
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
    return res.sendResponse(HttpCode.BAD_REQUEST, {
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
    return res.sendResponse(HttpCode.BAD_REQUEST, {
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

export default { parseUserGeoCoordinates };
