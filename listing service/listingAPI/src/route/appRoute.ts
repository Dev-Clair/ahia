import { Router } from "express";
import AppController from "../controller/appController";

const AppRouter = Router();

AppRouter.route("/").get(AppController);

export default AppRouter;
