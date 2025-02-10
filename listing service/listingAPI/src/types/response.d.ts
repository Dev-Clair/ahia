import { Response } from "express";

declare module "express-serve-static-core" {
    export interface Response {
        meta?: {
            timestamp: string;
            requestId?: string;
            pagination?: {
                total: number;
                limit: number;
                page: number;
                pages: number;
            }
        };
        sendResponse: (statusCode: number, data?: any, error?: any) => void;
    }
}