/**
 * @class QueryBuilder
 * Handles pagination, sorting and filtering of collection operations
 */
class QueryBuilder<T> {
  private query: any;

  private queryString: any;

  constructor(query: any, queryString: any) {
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

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

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
  paginate(): this {
    const page = parseInt(this.queryString.page, 10) || 1;

    const limit = parseInt(this.queryString.limit, 10) || 100;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

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

export default QueryBuilder;
