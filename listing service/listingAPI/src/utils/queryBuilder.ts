import { Query } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

/**
 * QueryBuilder
 * @method Exec - query execution
 * @method Filter - query filtering
 * @method GeoNear - geospatial (near queries)
 * @method Paginate - query pagination
 * @method Select - query projection
 * @method Sort - sorting
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
  public Filter(rangeFields: string[] = []): this {
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
      const lng = parseFloat(
        (this.queryString.lng as string) ?? (this.queryString.long as string)
      );

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
   * @returns Promise<this>
   */
  public async Paginate(): Promise<this> {
    const page = parseInt(this.queryString.page || "1", 10);

    const limit = parseInt(this.queryString.limit || "10", 10);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
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
      ...defaultFields,
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
