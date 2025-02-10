import { Response } from "express";

declare module "express-serve-static-core" {
    export interface Response {
        meta?: {
            timestamp: string;
            requestId?: string;
            pagination?: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            }
        };
        sendResponse: (statusCode: number, data?: any, message?: string) => void;
    }
}