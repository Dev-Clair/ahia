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
  sellsPage,
  sellsLimit,
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
    // Lease product filter
    const leaseFilter = {} as Record<string, any>;

    leaseFilter.leasePage = leasePage;

    leaseFilter.leaseLimit = leaseLimit;

    leaseFilter.status = "now-letting";

    promises.push(
      productService
        .findProductsByLocation(locationFilter, leaseFilter)
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
    // Reservation product filter
    const reservationFilter = {} as Record<string, any>;

    reservationFilter.reservationPage = reservationPage;

    reservationFilter.reservationLimit = reservationLimit;

    reservationFilter.status = "now-booking";

    promises.push(
      productService
        .findProductsByLocation(locationFilter, reservationFilter)
        .then((value) => {
          cache.set(reservationKey, value);

          return { status: "fulfilled", value };
        })
        .catch((reason) => ({ status: "rejected", reason }))
    );
  }

  // Sells Cache Key
  const salesKey = generateCacheKey("sell", {
    sellsPage,
    sellsLimit,
    zoneKey,
  });

  if (cache.has(salesKey)) {
    promises.push(
      Promise.resolve({ status: "fulfilled", value: cache.get(salesKey) })
    );
  } else {
    // Sell product filter
    const sellFilter = {} as Record<string, any>;

    sellFilter.sellsPage = sellsPage;

    sellFilter.sellsLimit = sellsLimit;

    sellFilter.status = "now-selling";

    promises.push(
      productService
        .findProductsByLocation(locationFilter, sellFilter)
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
  const leasePage = (queryString?.leasePage as string) || 1;

  const leaseLimit = (queryString?.leaseLimit as string) || 50;

  const reservationPage = (queryString?.reservationPage as string) || 1;

  const reservationLimit = (queryString?.reservationLimit as string) || 50;

  const sellsPage = (queryString?.sellsPage as string) || 1;

  const sellsLimit = (queryString?.sellsLimit as string) || 50;

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
