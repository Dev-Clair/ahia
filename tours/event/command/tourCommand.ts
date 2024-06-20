import TourModel from "../../src/model/tourModel";

const tourCommand = async (command: Object) => {
  await createTour(command);
};

const createTour = async (command: Object): Promise<void> => {
  await TourModel.create(command)
    .then((tour) => {
      console.log(
        `CREATE: Success | TOUR ID: ${tour._id} | CUSTOMER ID: ${tour.customerId}.`
      );
    })
    .catch((err) => {
      console.error(`CREATE: Failure | ERROR: ${err.message}`);
    });
};

export default tourCommand;
