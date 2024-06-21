import serverless from "serverless-http";
import App from "./api/app";
import Config from "./config";
import Connection from "./connection";
import TourCommand from "./event/tourCommand";

Connection(Config.MONGO_URI);

if (Config.NODE_ENV === "development") {
  App.listen(Config.SERVER_PORT, () => {
    console.log(
      `Server process started, listening on port ${Config.SERVER_PORT}`
    );
  });
} else {
  // const TourAPI = serverless(App);
  // const tour = async (event: any, context: any) => {
  //   if (event.source && event["detail-type"]) {
  //     await TourCommand(event, context);
  //   } else {
  //     return TourAPI(event, context);
  //   }
  // };
  // export default tour;
}
