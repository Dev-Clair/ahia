import { Request, Response } from "express";
import IDocument from "../interface/IDocument";

const Paginator = (req: Request, res: Response, resource: IDocument[]) =>
    res.meta!.pagination = {
        total: resource.length,

        limit: parseInt(req.queryString?.limit?.toString() ?? "10", 10),

        page: parseInt(req.queryString?.page as string, 10) ?? 1,

        pages: Math.ceil(resource.length / (req.queryString?.limit ? parseInt(req.queryString.limit.toString(), 10) : 10))
    }

export default Paginator;