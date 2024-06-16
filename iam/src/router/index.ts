import { Request, Response, Router, NextFunction } from "express";
import routerV1 from "./v1/iamRouter";
import routerV2 from "./v2/iamRouter";

const router = Router();

router.use("/v1/accounts", routerV1);

router.use("/v2/accounts", routerV2);

router.all("*", (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    message: `No resource or route defined for ${req.originalUrl}`,
  });
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    console.error({ message: `${err.message}` });

    return res.status(400).json({ message: "Bad JSON" });
  }

  next(err);
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);

  if (!res.headersSent) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

  return;
});

export default router;
