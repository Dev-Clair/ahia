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
   * Handles pagination operation
   * @returns Promise of type data and pagination metadata
   */
  async paginate(req: Request): Promise<PaginationResult<T>> {
    const page = parseInt(this.queryString.page || "1", 10);

    const limit = parseInt(this.queryString.limit || "2", 10);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    const data = await this.query;

    const totalItems = data.length;

    const totalPages = Math.ceil(totalItems / limit);

    const currentPage = page;

    const nextPage = page < totalPages ? currentPage + 1 : null;

    const prevPage = page > 1 ? currentPage - 1 : null;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`;

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
