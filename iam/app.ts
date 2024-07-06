import express, { Request, Response, Router, NextFunction } from "express";
import helmet from "helmet";
import hpp from "hpp";
import express_mongo_sanitize from "express-mongo-sanitize";
import IAMRouter from "./src/router/index";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(hpp());

app.use(express_mongo_sanitize());

app.use("/api", IAMRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    message: `No resource or route defined for ${req.originalUrl}`,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    console.error({ message: `${err.message}` });

    return res.status(400).json({ message: "Bad JSON" });
  }

  next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);

  if (!res.headersSent) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

  return;
});

export default app;
