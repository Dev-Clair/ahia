import Tour from "./src/model/tourModel";

const tourCommand = (command: Object) => {
  createTour(command);
};

const createTour = (command: Object) => {
  Tour.create(command)
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
