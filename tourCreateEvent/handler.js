const Config = require("./config");
const HttpClient = require("./httpClient");
const Mail = require("./mail");

const sender = Config.TOUR_NOTIFICATION_EMAIL;

const recipient = [Config.TOUR_ADMIN_EMAIL_I];

exports.tour = async (event, context) => {
  try {
    const payload = JSON.parse(event.detail);

    const url = `127.0.0.1:5999/api/v1/tours`; // Development URL or Elastic Beanstalk Application Public Endpoint

    const httpClient = new HttpClient(url, {
      "content-type": "application/json",
    });

    const createTour = await httpClient.Post(payload);

    if (createTour.statusCode !== 201)
      throw new Error(
        `Tour Creation Failed:\nURL: ${url}\nPayload: ${payload}\nError: ${createTour.body}`
      );
  } catch (err) {
    Mail(sender, recipient, "EVENT: TOUR CREATION ERROR", err.message);

    console.error(err);
  }
};
