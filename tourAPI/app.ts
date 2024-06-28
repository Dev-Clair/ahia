import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import express_mongo_sanitize from "express-mongo-sanitize";
import TourRouter from "./api/router";

const App = express();

App.use(express.json());

App.use(express.urlencoded({ extended: true }));

App.use(helmet());

App.use(hpp());

App.use(express_mongo_sanitize());

App.use("/api", TourRouter);

export default App;
