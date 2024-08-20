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
 * Handles pagination, sorting and filtering of collection operations
 */
export class QueryBuilder<T> {
  private query: Query<T[], T>;

  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString?: QueryString) {
    this.query = query;

    this.queryString = queryString ?? {};
  }

  /**
   * Handles geospatial queries: Near Operations
   * @returns this
   */
  geoNear(): this {
    if (this.queryString.lat && this.queryString.long) {
      const latitude = parseFloat(this.queryString.lat as string);

      const longitude = parseFloat(this.queryString.long as string);

      const distance =
        parseFloat(this.queryString.distance as string) ?? 5000.0;

      this.query = this.query.find({
        location: {
          $geoNear: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
          $maxDistance: distance,
        },
      });
    }

    return this;
  }

  /**
   * Handles filtering operation
   * @returns this
   */
  filter(): this {
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
   * Handles pagination operation
   * @param PaginationParams
   * @returns Promise of type data and pagination metadata
   */
  async paginate(params: PaginationParams): Promise<PaginationResult<T>> {
    const page = Math.max(parseInt(this.queryString.page || "1", 10));

    const limit = Math.max(parseInt(this.queryString.limit || "2", 10));

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
   * Handles search: retrieves selection that match search criteria
   * @returns this
   */
  search(): this {
    return this;
  }

  /**
   * Handles projection: specifies fields to be included or excluded in the return query
   * @returns this
   */
  select(selection: string[]): this {
    let fields: string = "";

    if (selection.length !== 0) {
      selection.forEach((element) => {
        fields = element.split(",").join(" ");
      });

      fields + " " + "-__v -createdAt -updatedAt";

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v -createdAt -updatedAt");
    }

    return this;
  }

  /**
   * Handles sorting operation
   * @returns this
   */
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  /**
   * Executes the query
   * @returns Promise of type any
   */
  exec(): Promise<T[]> {
    return this.query;
  }
}
