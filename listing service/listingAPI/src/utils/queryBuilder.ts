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
   * Handles default and geospatial query filtering
   */
  public Filter(): this {
    // Apply default filters
    let queryFilter: string

    const { page, limit, sort, fields, lat, lng, distance, radius, ...filters } = this.queryString;

    queryFilter = JSON.stringify(filters);

    queryFilter = queryFilter.replace(
      /\b(eq|ne|gte|gt|lte|lt|in|nin)\b/g,
      (match) => `$${match}`
    );

    const defaultFilter: Record<string, any> = JSON.parse(queryFilter);

    // Apply geospatial filters
    let locationFilter: Record<string, any> = {};

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

      if (parsedDistance !== undefined) {
        locationFilter["location"] = {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [parsedLng, parsedLat],
            },
            $maxDistance: parsedDistance,
          },
        };
      }

      if (parsedRadius !== undefined) {
        locationFilter["location"] = {
          $geoWithin: {
            $centerSphere: [[parsedLng, parsedLat], parsedRadius / 6378.1],
          },
        };
      }
    }

    const requestflter = { ...defaultFilter, ...locationFilter };

    this.query = this.query.find(requestflter);

    return this;
  }

  /**
   * Handles query pagination
   */
  public async Paginate(): Promise<this> {
    const page = parseInt((this.queryString.page as string) || "1", 10);

    const limit = parseInt((this.queryString.limit as string) || "20", 10);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  /**
   * Handles query projection
   * @param projection An array fields to select or exclude
   */
  public Select(projection: string[]): this {
    if (this.queryString.fields !== undefined) {
      let fields = [this.queryString.fields, ...projection];

      const selectObject: { [key: string]: 1 | 0 } = {};

      fields.forEach(field => {
        const include = !field.startsWith('-');

        const fieldName = field.replace('-', '');

        selectObject[fieldName] = include ? 1 : 0;
      });

      this.query = this.query.select(selectObject);
    } else {
      const selectObject: { [key: string]: 1 | 0 } = {};

      projection.forEach(field => {
        const include = !field.startsWith('-');

        const fieldName = field.replace('-', '');

        selectObject[fieldName] = include ? 1 : 0;
      });

      this.query = this.query.select(selectObject);
    }

    return this;
  }

  /**
     * Handles query sorting
     * @param sortFields An array fields to sort
     */
  public Sort(sortFields: string[]): this {
    if (this.queryString.sort !== undefined) {
      let sort = [this.queryString.sort, ...sortFields];

      const sortObject: { [key: string]: 1 | -1 } = {};

      sort.forEach(field => {
        const order = field.startsWith('-') ? -1 : 1;

        const fieldName = field.replace('-', '');

        sortObject[fieldName] = order;
      });

      this.query = this.query.sort(sortObject);
    } else {
      const sortObject: { [key: string]: 1 | -1 } = {};

      sortFields.forEach(field => {
        const order = field.startsWith('-') ? -1 : 1;

        const fieldName = field.replace('-', '');

        sortObject[fieldName] = order;
      });

      this.query = this.query.sort(sortObject);
    }

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
