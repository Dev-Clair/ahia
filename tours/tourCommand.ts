import Tour from "./src/model/tourModel";

const tourCommand = async (payment: Object) => {
  createTour(payment);
};

const createTour = async (payment: Object) => {
  try {
    const newTour = await Tour.create(payment);
    console.log(
      `CREATE: Success | TOUR ID: ${newTour._id} | CUSTOMER NAME: ${newTour.customerId}.`
    );
  } catch (err: any) {
    console.error(`CREATE: Failure | ERROR: ${err.message}`);
  }
};

export default tourCommand;
