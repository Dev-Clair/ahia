const BookRealtor = require("./bookRealtor");
const Config = require("./config");
const Connection = require("./connection");
const RetrieveRealtor = require("./retrieveRealtor");
const UpdateTour = require("./updateTour");

Connection(Config.MONGO_URI);

exports.tour = async (event, context) => {
  const tour = event.detail;

  const { location } = tour;

  const realtor = await RetrieveRealtor(location);
  if (!realtor) {
    throw new Error(`No available realtor found for ${tour._id}`);
  }

  const { id, email } = realtor;

  await UpdateTour(tour._id, { realtor: { id: id, email: email } });

  await BookRealtor(realtor.id);

  console.log("Tour updated successfully");
};
