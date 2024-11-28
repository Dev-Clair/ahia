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

    const results = await promiseServiceFactory(parsedQueryString);

    const response = {
      leases: results[0].status === "fulfilled" ? results[0].value : null,
      reservations: results[1].status === "fulfilled" ? results[1].value : null,
      sells: results[2].status === "fulfilled" ? results[2].value : null,
    };

    return res.status(HttpCode.OK).json({ data: response });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Evaluates and returns an array of fulfilled or rejected promises
 * @param queryString query object
 */
const promiseServiceFactory = async ({
  leasePage,
  leaseLimit,
  reservationPage,
  reservationLimit,
  sellPage,
  sellLimit,
  lat,
  lng,
}: Record<string, any>) => {
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

  // Listing location filter
  const locationFilter = {
    lat: lat,
    lng: lng,
    radius: radius,
  };

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
    // Lease filter
    const leaseFilter = {} as Record<string, any>;

    leaseFilter.leasePage = leasePage;

    leaseFilter.leaseLimit = leaseLimit;

    leaseFilter.status = "now-letting";

    promises.push(
      productService
        .findProductsByListing(locationFilter, leaseFilter)
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
    // Reservation filter
    const reservationFilter = {} as Record<string, any>;

    reservationFilter.reservationPage = reservationPage;

    reservationFilter.reservationLimit = reservationLimit;

    reservationFilter.status = "now-booking";

    promises.push(
      productService
        .findProductsByListing(locationFilter, reservationFilter)
        .then((value) => {
          cache.set(reservationKey, value);

          return { status: "fulfilled", value };
        })
        .catch((reason) => ({ status: "rejected", reason }))
    );
  }

  // Sell Cache Key
  const sellKey = generateCacheKey("sell", {
    sellPage,
    sellLimit,
    zoneKey,
  });

  if (cache.has(sellKey)) {
    promises.push(
      Promise.resolve({ status: "fulfilled", value: cache.get(sellKey) })
    );
  } else {
    // Sell filter
    const sellFilter = {} as Record<string, any>;

    sellFilter.sellPage = sellPage;

    sellFilter.sellLimit = sellLimit;

    sellFilter.status = "now-selling";

    promises.push(
      productService
        .findProductsByListing(locationFilter, sellFilter)
        .then((value) => {
          cache.set(sellKey, value);

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
  const {
    leasePage = 1,
    leaseLimit = 50,
    reservationPage = 1,
    reservationLimit = 50,
    sellPage = 1,
    sellLimit = 50,
  } = queryString;

  return {
    leasePage,
    leaseLimit,
    reservationPage,
    reservationLimit,
    sellPage,
    sellLimit,
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
