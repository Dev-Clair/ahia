import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import express_mongo_sanitize from "express-mongo-sanitize";
import router from "./src/router/index";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(hpp());

app.use(express_mongo_sanitize());

app.use("/api", router);

export default app;
