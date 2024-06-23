import EventPayloadInterface from "./interface/eventPayloadInterface";
import CastError from "./error/castError";
import DuplicateEventError from "./error/duplicateEventError";
import EventPayloadError from "./error/eventPayloadError";
import SchemaValidationError from "./error/schemaValidationError";
import TourModel from "../src/model/tourModel";
import TourIdempotencyModel from "../src/model/tourIdempotencyModel";

const TourCommand = async (event: any, context: any) => {
  try {
    let payload;

    payload = JSON.parse(event.detail);

    const { fullDocument: paymentDetails } = payload;

    if (
      !paymentDetails ||
      !paymentDetails.transactionRef ||
      !paymentDetails.customerId ||
      !paymentDetails.listingIds
    ) {
      throw new EventPayloadError("Invalid event detail structure");
    }
    const {
      customerId: customerId,
      listingIds: listingIds,
      transactionRef: transactionRef,
    } = paymentDetails;

    const verifyTransactionRef = await TourIdempotencyModel.findOne({
      key: transactionRef,
    });

    if (verifyTransactionRef) {
      throw new DuplicateEventError(
        `Duplicate event detected: ${transactionRef}`
      );
    }

    const command: EventPayloadInterface = {
      customerId: customerId,
      listingIds: listingIds,
    };

    await TourModel.create(command)
      .then(async (tour) => {
        console.log(
          `CREATE: Success | TOUR ID: ${tour._id} | CUSTOMER ID: ${tour.customerId}.`
        );

        // Send mail or sms notification to customer to schedule tour date and time
        // await notifyCustomer();

        await TourIdempotencyModel.create({
          key: transactionRef,
          response: { tourId: tour._id, customerId: tour.customerId },
        });
      })
      .catch((err) => {
        if (err.name === "ValidationError") {
          throw new SchemaValidationError(
            "CREATE: Failure | ERROR: Tour validation failed\n",
            err.errors
          );
        }

        if (err.name === "CastError") {
          throw new CastError(
            `CREATE: Failure | ERROR: Invalid data type provided:\n ${err.message}`
          );
        }

        throw new Error(
          `CREATE: Failure | ERROR: Unknown error occured:\n name: ${err.name}\nmessage: ${err.message}`
        );
      });
  } catch (err: any) {
    // Send mail or sms notification to admin about critical error
    // await notifyAdmin();

    console.error(
      `Unknown error:\n name: ${err.name}\nmessage:  ${err.message}`
    );
  }
};

export default TourCommand;
