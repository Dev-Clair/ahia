import serverless from "serverless-http";
import app from "./app";
import Config from "./config";
import Connection from "./connection";
import tourCommand from "./tourCommand";

Connection(Config.MONGO_URI);

// app.listen(Config.SERVER_PORT, () => {
//   console.log(
//     `Server process started, listening on port ${Config.SERVER_PORT}`
//   );
// });

const tourAPI = serverless(app);

const tour = async (event: any, context: any) => {
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

    tourCommand(command);
  } else {
    return tourAPI(event, context);
  }
};

export default tour;
