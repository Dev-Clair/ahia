import HttpCode from "../enum/httpCode";
import Cache from "../utils/cache";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IPaginationParams from "../interface/IPaginationparams";
import { NextFunction, Request, Response } from "express";
import ProductService from "../service/productService";

/**
 * Retrieve resources dynamically
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const appController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const parsedGeoCoordinates = geoCoordinatesParser(
      req.geoCoordinates as IGeoCoordinates
    );

    const parsedPaginationParams = paginationParamsParser(queryString);

    const parsedQueryString = {
      ...parsedPaginationParams,
      ...parsedGeoCoordinates,
    };

    const results = await serviceFactory(parsedQueryString);

    const response = {
      leases: results[0].status === "fulfilled" ? results[0].value : null,
      reservations: results[1].status === "fulfilled" ? results[1].value : null,
      sells: results[2].status === "fulfilled" ? results[2].value : null,
    };

    res.status(HttpCode.OK).json({ data: response });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Evaluates and returns an array of fulfilled or rejected promises
 * @param queryString query object
 */
const serviceFactory = async ({
  leasePage,
  leaseLimit,
  reservationPage,
  reservationLimit,
  sellsPage,
  sellsLimit,
  lat,
  lng,
}: IPaginationParams) => {
  const productService = ProductService.Create();

  const promises: Promise<any>[] = [];

  const cache = Cache.LruCache;

  // Fixed search radius (kilometers)
  const radius = 10;

  // Map the user's position to predefined zone to determine if a cached response can be used
  let zoneKey: string | null = null;

  if (lat && lng) {
    zoneKey = getZoneCacheKey(lat, lng, radius);
  }

  // Lease Cache Key
  const leaseKey = generateCacheKey("lease", {
    leasePage,
    leaseLimit,
    zoneKey,
  });

  if (cache.has(leaseKey)) {
    promises.push(
      Promise.resolve({ status: "fulfilled", value: cache.get(leaseKey) })
    );
  } else {
    promises.push(
      productService
        .findAllLease({
          page: leasePage || 1,
          limit: leaseLimit || 10,
          status: "now-letting",
          ...{ lat, lng, radius },
        })
        .then((value) => {
          cache.set(leaseKey, value);

          return { status: "fulfilled", value };
        })
        .catch((reason) => ({ status: "rejected", reason }))
    );
  }

  // Reservation Cache Key
  const reservationKey = generateCacheKey("reservation", {
    reservationPage,
    reservationLimit,
    zoneKey,
  });

  if (cache.has(reservationKey)) {
    promises.push(
      Promise.resolve({
        status: "fulfilled",
        value: cache.get(reservationKey),
      })
    );
  } else {
    promises.push(
      productService
        .findAllReservation({
          page: reservationPage || 1,
          limit: reservationLimit || 10,
          status: "now-booking",
          ...{ lat, lng, radius },
        })
        .then((value) => {
          cache.set(reservationKey, value);

          return { status: "fulfilled", value };
        })
        .catch((reason) => ({ status: "rejected", reason }))
    );
  }

  // Sells Cache Key
  const salesKey = generateCacheKey("sales", {
    sellsPage,
    sellsLimit,
    zoneKey,
  });

  if (cache.has(salesKey)) {
    promises.push(
      Promise.resolve({ status: "fulfilled", value: cache.get(salesKey) })
    );
  } else {
    promises.push(
      productService
        .findAllSell({
          page: sellsPage || 1,
          limit: sellsLimit || 10,
          status: "now-selling",
          ...{ lat, lng, radius },
        })
        .then((value) => {
          cache.set(salesKey, value);

          return { status: "fulfilled", value };
        })
        .catch((reason) => ({ status: "rejected", reason }))
    );
  }

  return await Promise.allSettled(promises);
};

/**
 * Parses pagination params in the request query object
 * @param queryString query object
 */
const paginationParamsParser = (
  queryString: IPaginationParams
): Record<string, any> => {
  const leasePage = queryString?.leasePage as string;

  const leaseLimit = queryString?.leaseLimit as string;

  const reservationPage = queryString?.reservationPage as string;

  const reservationLimit = queryString?.reservationLimit as string;

  const sellsPage = queryString?.sellsPage as string;

  const sellsLimit = queryString?.sellsLimit as string;

  return {
    leasePage,
    leaseLimit,
    reservationPage,
    reservationLimit,
    sellsPage,
    sellsLimit,
  };
};

/**
 * Parses geocoordinates in the request query object
 * @param queryString query object
 */
const geoCoordinatesParser = (
  queryString: IGeoCoordinates
): Record<string, any> => {
  const { lat, lng } = queryString;

  return { lat, lng };
};

/**
 * Helper function to generate a cache key based on preefix and query params
 * @param prefix lease | reservation | sell
 * @param queryParams query params
 */
const generateCacheKey = (
  prefix: string,
  queryParams: Record<string, any>
): string => {
  return `${prefix}-${JSON.stringify(queryParams)}`;
};

/**
 * Helper function to generate a cache key based on zones defined by a fixed radius
 * @param lat latitude point
 * @param lng longitude point
 * @param radius search radius
 */
const getZoneCacheKey = (lat: number, lng: number, radius: number): string => {
  const latZone = Math.floor(lat / radius);

  const lngZone = Math.floor(lng / radius);

  return `zone_${latZone}_${lngZone}`;
};

export default appController;
