const Config = require("./config");
const HttpClient = require("./httpClient");
const Mail = require("./mail");

const sender = Config.TOUR_NOTIFICATION_EMAIL;

const recipient = [Config.TOUR_ADMIN_EMAIL_I];

exports.tour = async (event, context) => {
  try {
    const payload = JSON.parse(event.detail);

    const url = `www.ahia.com/tours/`; // Development URL or Elastic Beanstalk Application Public Endpoint

    const createTour = await new HttpClient(url, {
      "Content-Type": "application/json",
    }).Post(payload);

    if (createTour.statusCode !== 201)
      throw new Error(
        `Tour Creation Failed:\nURL: ${url}\nPayload: ${payload}\nError: ${createTour.body}`
      );
  } catch (err) {
    Mail(sender, recipient, "TOUR EVENT CREATE ERROR", err.message);

    console.error(err);
  }
};
