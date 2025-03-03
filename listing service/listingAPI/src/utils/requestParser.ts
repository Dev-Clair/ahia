import { Request } from "express";

/**
 * Parses and transforms the request query string
 * @param req Express Request Object
 */
const RequestParser = (req: Request): Record<string, any> => {
    let queryFields: string = req.query?.fields as string ?? "";

    const parsedFields = (req.user?.roles.includes("Admin") || req.user?.roles.includes("Provider")) || req.user?.permissions.includes("user:prime")
        ?
        `address, ${queryFields}`
        :
        queryFields;

    const queryString = {
        page: parseInt((req.query.page as string) ?? "1", 10),
        limit: parseInt((req.query.limit as string) ?? "20", 10),
        fields: parsedFields,
        sort: req.query?.sort as string,
    };

    return queryString;
};

export default RequestParser;
