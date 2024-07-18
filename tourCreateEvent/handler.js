const Config = require("./config");
const CreateTour = require("./createTour");
const Mail = require("./mail");
const Retry = require("./retry");

exports.tour = async (event, context) => {
  const sender = Config.TOUR_NOTIFICATION_EMAIL;

  const recipient = [Config.TOUR_ADMIN_EMAIL_I];

  try {
    const payload = JSON.parse(event.detail);

    const createTour = await Retry.ExponentialJitterBackoff(() =>
      CreateTour(payload)
    );

    if (createTour.statusCode !== 201)
      throw new Error(
        `Tour Creation Failed:\nError: ${createTour.body}\nPayload: ${payload}`
      );
  } catch (err) {
    Mail(sender, recipient, "TOUR CREATION ERROR", err.message);

    console.error(err);
  }
};
