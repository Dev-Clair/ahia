import { Response } from "express";

declare module "express-serve-static-core" {
    export interface Response {
        meta?: {
            request: {
                id: string; timestamp: string; idempotent?: boolean
            };
            pagination?: {
                total: number;
                page: number;
                limit: number;
                pages: number;
            }
        };
        sendResponse: (statusCode: number, body?: any) => void;
    }
}