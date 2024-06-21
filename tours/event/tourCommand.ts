import CommandInterface from "./interface/commandInterface";
import CastError from "./error/castError";
import ValidationError from "./error/validationError";
import CommandError from "./error/commandError";
import TourModel from "../src/model/tourModel";

const TourCommand = async (event: any, context: any) => {
  try {
    let payload;

    payload = JSON.parse(event.detail);

    const { fullDocument: paymentDetails } = payload;

    if (
      !paymentDetails ||
      !paymentDetails.customerId ||
      !paymentDetails.listingIds
    ) {
      throw new CommandError("Invalid event detail structure");
    }
    const { customerId: customerId, listingIds: listingIds } = paymentDetails;

    const command: CommandInterface = {
      customerId: customerId,
      listingIds: listingIds,
    };

    await TourModel.create(command)
      .then((tour) => {
        console.log(
          `CREATE: Success | TOUR ID: ${tour._id} | CUSTOMER ID: ${tour.customerId}.`
        );
      })
      .catch((err) => {
        if (err.name === "ValidationError") {
          throw new ValidationError(
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
    if (
      err instanceof CommandError ||
      err instanceof ValidationError ||
      err instanceof CastError
    ) {
      // Send mail or sms notification to admin
      // await notifyAdmin();
    } else {
    }

    console.error(
      `Unknown Error:\n name: ${err.name}\nmessage:  ${err.message}`
    );
  }
};

export default TourCommand;
