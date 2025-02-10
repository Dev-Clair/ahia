import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

/**
 * Initializes and transforms response from the server
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const responseParser = (req: Request, res: Response, next: NextFunction): void => {
    res.meta = {
        timestamp: new Date().toISOString(),
        requestId: randomUUID(),
    }

    res.sendResponse = (statusCode, data, message) => {
        res.status(statusCode).json({
            meta: res.meta, data: data ?? null,
            message: message ?? null
        });
    }

    next();
}

export default { responseParser }