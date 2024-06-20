import Tour from "./src/model/tourModel";

const tourCommand = async (command: Object) => {
  createTour(command);
};

const createTour = async (command: Object) => {
  try {
    const newTour = await Tour.create(command);
    console.log(
      `CREATE: Success | TOUR ID: ${newTour._id} | CUSTOMER ID: ${newTour.customerId}.`
    );
  } catch (err: any) {
    console.error(`CREATE: Failure | ERROR: ${err.message}`);
  }
};

export default tourCommand;
