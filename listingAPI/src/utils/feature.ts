import { Request } from "express";
import { Document, Model } from "mongoose";

interface PaginationOptions {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  links: {
    next: string | null;
    prev: string | null;
  };
}

const Features = async <M extends Document>(
  model: Model<M>,
  query: object = {},
  req: Request
): Promise<{ data: M[]; pagination: PaginationOptions }> => {
  /**
   * Pagination
   */
  const defaultLimit = 2;

  const queryLimit = parseInt(req.query.limit as string);

  const queryPage = parseInt(req.query.page as string) || 1;

  const limit = queryLimit <= defaultLimit ? queryLimit : defaultLimit;

  const page = queryPage;

  const skip = (page - 1) * limit;

  /**
   * Sorting
   */
  const sortOptions = ["asc", "ascending", "desc", "descending", 1, -1];

  const defaultSort = "asc";

  const querySort = sortOptions.includes(req.query.sort as string)
    ? (req.query.sort as string)
    : defaultSort;

  const sort = querySort || defaultSort;

  /**
   * Filtering
   */
  const filterOptions = ["gt", "gte", "lt", "lte"];

  const data = await model.find(query).skip(skip).limit(limit).sort(sort);

  const totalItems = await model.countDocuments(query);

  const totalPages = Math.ceil(totalItems / limit);

  const nextPage = page < totalPages ? page + 1 : null;

  const prevPage = page > 1 ? page - 1 : null;

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
      page,
      limit,
      totalPages,
      totalItems,
      links,
    },
  };
};

export default Features;
