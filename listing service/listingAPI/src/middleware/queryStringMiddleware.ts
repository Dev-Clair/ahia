import { NextFunction, Request, Response } from "express";
import IQueryString from "../interface/IQuerystring";

/**
 * Parses and transforms the request query string
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const ParseQueryString = (
    req: Request,
    res: Response,
    next: NextFunction): Response | void => {
    const fields = (): string | undefined => {
        if (req.user?.permissions.includes("user:basic")) return "";

        if (req.user?.permissions.includes("user:plus")) return "address";

        if (req.user?.permissions.includes("user:prime")) return "location, address";

        return undefined;
    }

    req.queryString = {
        page: parseInt((req.query?.page as string) ?? "1", 10),
        limit: parseInt((req.query?.limit as string) ?? "20", 10),
        fields: fields,
        sort: req.query?.sort as string,
    } as IQueryString;

    next()
};

export default { ParseQueryString };
