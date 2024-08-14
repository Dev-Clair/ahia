import { Query, Model } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}
/**
 * @class QueryBuilder
 * Handles pagination, sorting and filtering of collection operations
 */
export class QueryBuilder<T> {
  private query: Query<T[], T>;

  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;

    this.queryString = queryString;
  }
  /**
   * Handles filtering operation
   * @returns this
   */
  filter(): this {
    const queryObj = { ...this.queryString };

    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(eq|ne|gte|gt|lte|lt|in|nin)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

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
   * Handles pagination operation
   * @returns this
   */
  async paginate(model: Model<T>): Promise<PaginationResult<T>> {
    const page = parseInt(this.queryString.page || "1", 10);

    const limit = parseInt(this.queryString.limit || "100", 10);

    const skip = (page - 1) * limit;

    const totalItems = await model.countDocuments(this.query);

    const totalPages = Math.ceil(totalItems / limit);

    this.query = this.query.skip(skip).limit(limit);

    const data = await this.query;

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  /**
   * Executes the query
   * @returns Promise of type any
   */
  exec(): Query<T[], T> {
    return this.query;
  }
}
