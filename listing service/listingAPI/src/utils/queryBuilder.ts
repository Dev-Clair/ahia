import { Query } from "mongoose";
import IQueryString from "../interface/IQuerystring";

export class QueryBuilder<T> {
  private query: Query<T[], T>;

  private queryString: IQueryString;

  constructor(query: Query<T[], T>, queryString?: IQueryString) {
    this.query = query;

    this.queryString = queryString ?? {};
  }

  /**
   * Executes the query
   */
  public Exec(): Promise<T[]> {
    return this.query.exec();
  }

  /**
   * Handles query filtering
   */
  public Filter(): this {
    const { page, sort, limit, fields, ...filters } = this.queryString;

    let queryString = JSON.stringify(filters);

    queryString = queryString.replace(
      /\b(eq|ne|gte|gt|lte|lt|in|nin)\b/g,
      (match) => `$${match}`
    );

    const parsedQuery = JSON.parse(queryString);

    this.query = this.query.find(parsedQuery);

    return this;
  }

  /**
   * Handles geospatial queries: Near | Within
   */
  public GeoSpatial(): this {
    if (this.queryString.lng && this.queryString.lat) {
      const parsedLng = parseFloat(this.queryString.lng as string);

      const parsedLat = parseFloat(this.queryString.lat as string);

      if (isNaN(parsedLng) || isNaN(parsedLat))
        throw new Error("Invalid coordinates provided for geospatial query.");

      const parsedDistance = this.queryString?.distance
        ? parseFloat(this.queryString.distance as string)
        : undefined;

      const parsedRadius = this.queryString?.radius
        ? parseFloat(this.queryString.radius as string)
        : undefined;

      let locationFilter;

      if (parsedDistance !== undefined) {
        const nearQueryFilter = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parsedLng, parsedLat],
            },
            $maxDistance: parsedDistance,
          },
        };

        locationFilter = nearQueryFilter;
      }

      if (parsedRadius !== undefined) {
        const withinQueryFilter = {
          $geoWithin: {
            $centerSphere: [[parsedLng, parsedLat], parsedRadius / 6378.1],
          },
        };

        locationFilter = withinQueryFilter;
      }

      this.query = this.query.find({ location: locationFilter });
    }

    return this;
  }

  /**
   * Handles query pagination
   */
  public async Paginate(): Promise<this> {
    const page = parseInt((this.queryString.page as string) || "1", 10);

    const limit = parseInt((this.queryString.limit as string) || "50", 10);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  /**
   * Handles query projection
   * @param selectFields A key-value pair of fields to select
   */
  public Select(selectFields: string[]): this {
    const fields = Array.from(
      new Set([this.queryString.fields, selectFields])
    ).join();

    this.query = this.query.select(fields);

    return this;
  }

  /**
   * Handles query sorting
   * @param sortFields A key-value pair of fields to sort
   */
  public Sort(sortFields: string[]): this {
    const sortBy = Array.from(
      new Set([this.queryString.sort, sortFields])
    ).join();

    this.query = this.query.sort(sortBy);

    return this;
  }

  /**
   * Creates and returns a new instance of the QueryBuilder class
   * @param query mongoose query
   * @param queryString query object
   */
  static Create<T>(
    query: Query<T[], T>,
    queryString?: IQueryString
  ): QueryBuilder<T> {
    return new QueryBuilder(query, queryString);
  }
}
