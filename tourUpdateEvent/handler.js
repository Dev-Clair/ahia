const BookRealtor = require("./bookRealtor");
const Mail = require("./mail");
const RetrieveRealtor = require("./retrieveRealtor");
const Retry = require("./retry");
const UpdateTour = require("./updateTour");

exports.tour = async (event, context) => {
  const sender = Config.TOUR_NOTIFICATION_EMAIL;

  const recipient = [Config.TOUR_ADMIN_EMAIL_I];

  try {
    const tour = JSON.parse(event.detail);

    const { id, location } = tour;

    const getRealtor = await Retry.LinearJitterBackoff(() =>
      RetrieveRealtor(location)
    );

    if (getRealtor.statusCode !== 200) {
      throw new Error(`No available realtor found for location ${location}`);
    }

    const realtor = getRealtor.body;

    const payload = {
      realtor: {
        id: realtor.id,
        email: realtor.companyInformation.email || realtor.email,
      },
    };

    const updateTour = await Retry.ExponentialBackoff(() =>
      UpdateTour(id, payload)
    );

    if (updateTour.getStatusCode !== 204) {
      throw new Error(`Cannot create realtor details for tour: ${id}`);
    }

    const bookRealtor = await Retry.ExponentialBackoff(() =>
      BookRealtor(realtor.id)
    );

    if (bookRealtor.getStatusCode !== 204) {
      throw new Error(
        `Failed to update availability status for realtor: ${realtor.id}`
      );
    }

    console.log(`Tour: ${id} updated successfully`);
  } catch (err) {
    Mail(sender, recipient, "TOUR EVENT UPDATE ERROR", err.message);

    console.error(err.message);
  }
};
