import Tour from "./api/src/model/tourModel";

const tourCommand = async (command: Object) => {
  await createTour(command);
};

const createTour = async (command: Object) => {
  await Tour.create(command)
    .then((newTour) => {
      console.log(
        `CREATE: Success | TOUR ID: ${newTour._id} | CUSTOMER ID: ${newTour.customerId}.`
      );
    })
    .catch((err) => {
      console.error(`CREATE: Failure | ERROR: ${err.message}`);
    });
};
export default tourCommand;
