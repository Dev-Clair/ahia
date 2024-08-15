import { Query } from "mongoose";
import { Request } from "express";

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
   * Handles pagination operation
   * @returns Promise of type data and pagination metadata
   */
  async paginate(
    protocol: string,
    host: string | undefined,
    baseURL: string,
    path: string
  ): Promise<PaginationResult<T>> {
    const page = Math.max(parseInt(this.queryString.page || "1", 10));

    const limit = Math.max(parseInt(this.queryString.limit || "2", 10));

    const skip = (page - 1) * limit;

    const countQuery = this.query.model.find(this.query.getQuery());

    this.query = this.query.skip(skip).limit(limit);

    const [data, totalItems] = await Promise.all([
      this.query,
      countQuery.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const currentPage = page;

    const nextPage = page < totalPages ? currentPage + 1 : null;

    const prevPage = page > 1 ? currentPage - 1 : null;

    const baseUrl = `${protocol}://${host}${baseURL}${path}`;

    const links = {
      next: nextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}` : null,
      prev: prevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}` : null,
    };

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        links,
      },
    };
  }

  /**
   * Executes the query
   * @returns Promise of type any
   */
  exec(): Promise<T[]> {
    return this.query;
  }
}
