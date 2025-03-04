import { ObjectId } from "mongoose";
import { Request, Response } from "express";
import IDocument from "../interface/IDocument";

const Paginator = (req: Request, res: Response, resource: IDocument[] | ObjectId[]) =>
    res.meta!.pagination = {
        total: resource.length,

        page: parseInt(req.query?.page as string ?? "1", 10),

        limit: parseInt(req.query?.limit?.toString() ?? "20", 10),

        pages: Math.ceil(resource.length /
            (req.query?.limit ? parseInt(req.query?.limit.toString() ?? "20", 10) : 20)
        )
    }

export default Paginator;
