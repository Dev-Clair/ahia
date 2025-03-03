import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

/**
 * Initializes and transforms response from the server
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const ParseResponseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    res.meta = {
        request: {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            idempotent: req.get("idempotency-key") ? true : false
        },
    }

    res.sendResponse = (statusCode, body) => {
        res.status(statusCode).json({
            meta: res.meta,
            ...body ?? null,
        });
    }

    next();
}

export default { ParseResponseMiddleware };