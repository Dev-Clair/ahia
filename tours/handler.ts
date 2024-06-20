import serverless from "serverless-http";
import App from "./api/app";
import Config from "./config";
import Connection from "./connection";
import tourCommand from "./event/command/tourCommand";

Connection(Config.MONGO_URI);

const tourAPI = serverless(App);

const tour = async (event: any, context: any) => {
  try {
    if (event.source && event["detail-type"]) {
      let payload;

      payload = JSON.parse(event.detail);

      const { fullDocument: paymentDetails } = payload;

      const { customerId: customerId, listingsId: listingIds } = paymentDetails;

      const command: {
        customerId: string;
        listingIds: string[];
      } = {
        customerId: customerId,
        listingIds: listingIds,
      };

      await tourCommand(command);
    } else {
      return tourAPI(event, context);
    }
  } catch (err: any) {
    console.error(err);
  }
};

export default tour;
