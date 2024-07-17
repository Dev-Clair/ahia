const BookRealtor = require("./bookRealtor");
const RetrieveRealtor = require("./retrieveRealtor");
const Retry = require("./retry");
const UpdateTour = require("./updateTour");

exports.tour = async (event, context) => {
  try {
    const tour = event.detail;

    const { location } = tour;

    const realtor = await Retry.LinearJitterBackoff(() =>
      RetrieveRealtor(location)
    );

    if (!realtor) {
      throw new Error(`No available realtor found for ${tour._id}`);
    }

    await Retry.ExponentialBackoff(() =>
      UpdateTour(tour._id, {
        realtor: { id: realtor.id, email: realtor.email },
      })
    );

    await Retry.ExponentialBackoff(() => BookRealtor(realtor.id));

    console.log(`Tour: ${tour._id} updated successfully`);
  } catch (err) {
    console.error(err);
  }
};
