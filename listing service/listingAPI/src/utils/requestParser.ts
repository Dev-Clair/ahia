import { Request } from "express";

/**
 * Parses and transforms the request query string
 * @param req Express Request Object
 */
const RequestParser = (req: Request): Record<string, any> => {

    const fields = (req.user?.roles.includes("Admin") || req.user?.roles.includes("Provider")) || req.user?.permissions.includes("user:prime") ? "location, address" : "";

    const queryString = {
        page: parseInt((req.query?.page as string) ?? "1", 10),
        limit: parseInt((req.query?.limit as string) ?? "20", 10),
        fields: fields,
        sort: req.query?.sort as string,
    };

    return queryString;
};

export default RequestParser;
