import { Query } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

interface PaginationParams {
  protocol: string;
  host?: string;
  baseUrl: string;
  path: string;
}

interface PaginationResult<T> {
  data: T[];
  metaData: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    links: {
      next: string | null;
      prev: string | null;
    };
  };
}

/**
 * @class QueryBuilder
 * Improves query performance
 * @method Exec - executes
 * @method Filter - filtering
 * @method GeoNear - geospatial (near queries)
 * @method Paginate - pagination
 * @method Select - projection
 * @method Sort - sorting
 * @method Create - factory
 */
export class QueryBuilder<T> {
  private query: Query<T[], T>;

  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString?: QueryString) {
    this.query = query;

    this.queryString = queryString ?? {};
  }

  /**
   * Executes the query
   * @returns Promise of type any
   */
  public Exec(): Promise<T[]> {
    return this.query.exec();
  }

  /**
   * Handles query filtering
   * @returns this
   */
  public Filter(): this {
    const queryObject = { ...this.queryString };

    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObject[el]);

    let queryString = JSON.stringify(queryObject);

    queryString = queryString.replace(
      /\b(eq|ne|gte|gt|lte|lt|in|nin)\b/g,
      (match) => `$${match}`
    );

    const parsedQueryString = JSON.parse(queryString);

    this.query = this.query.find(parsedQueryString);

    return this;
  }

  /**
   * Handles geospatial queries: Near Query
   * @returns this
   */
  public GeoNear(): this {
    if (this.queryString.lnglat) {
      const lng = parseFloat(this.queryString.lng as string);

      const lat = parseFloat(this.queryString.lat as string);

      const distance =
        parseFloat(this.queryString.distance as string) ?? 2000.0;

      this.query = this.query.find({
        location: {
          $geoNear: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
          $maxDistance: distance,
        },
      });
    }

    return this;
  }

  /**
   * Handles query pagination
   * @param PaginationParams
   * @returns Promise of type data and pagination metadata
   */
  public async Paginate(
    params: PaginationParams
  ): Promise<PaginationResult<T>> {
    const page = parseInt(this.queryString.page || "1", 10);

    const limit = parseInt(this.queryString.limit || "2", 10);

    const skip = (page - 1) * limit;

    const queryCount = this.query.model.find(this.query.getQuery());

    this.query = this.query.skip(skip).limit(limit);

    const [data, totalItems] = await Promise.all([
      this.query,
      queryCount.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const currentPage = page;

    const nextPage = page < totalPages ? currentPage + 1 : null;

    const previousPage = page > 1 ? currentPage - 1 : null;

    const { protocol, host, baseUrl, path } = params;

    const url = `${protocol}://${host}${baseUrl}${path}`;

    const links = {
      next: nextPage ? `${url}?page=${nextPage}&limit=${limit}` : null,
      prev: previousPage ? `${url}?page=${previousPage}&limit=${limit}` : null,
    };

    return {
      data,
      metaData: {
        totalItems,
        totalPages,
        currentPage,
        links,
      },
    };
  }

  /**
   * Handles query projection
   * @returns this
   */
  public Select(specifiedFields: string[] = []): this {
    const defaultFields = ["-__v", "-createdAt", "-updatedAt"];

    const fields = [
      this.queryString.fields,
      ...specifiedFields,
      defaultFields,
    ].join(" ");

    this.query = this.query.select(fields);

    return this;
  }

  /**
   * Handles query sorting
   * @returns this
   */
  public Sort(defaultSortField = "-createdAt"): this {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(",").join(" ")
      : defaultSortField;

    this.query = this.query.sort(sortBy);

    return this;
  }

  /**
   * Creates and returns a new instance of the QueryBuilder class
   * @param query
   * @param queryString
   * @returns QueryBuilder
   */
  static Create<T>(
    query: Query<T[], T>,
    queryString?: QueryString
  ): QueryBuilder<T> {
    return new QueryBuilder(query, queryString);
  }
}
