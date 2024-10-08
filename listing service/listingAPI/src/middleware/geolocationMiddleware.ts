import Config from "../../config";
import HttpCode from "../enum/httpCode";
import { NextFunction, Request, Response } from "express";

/**
 * Retrieves a location's coordinates using google map API
 */
const getGeoCoordinates = async () => {};

/**
 * Parses and verifies a user's geoCoordinates from the geolocator API
 */
const parseUserGeoCoordinates = async () => {};

export default { getGeoCoordinates, parseUserGeoCoordinates };
