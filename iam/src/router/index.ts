import { Router } from "express";
import RouterV1 from "./v1/iamRouter";
import RouterV2 from "./v2/iamRouter";

const IAMRouter = Router();

IAMRouter.use("/v1/iam", RouterV1);

IAMRouter.use("/v2/iam", RouterV2);

export default IAMRouter;
