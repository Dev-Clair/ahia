const TourGenerator = require("./tourGenerator");
const TourNotificationManager = require("./tourNotificationManager");

const TourNotification = async () => {
  const tourGenerator = TourGenerator();

  for await (const tour of tourGenerator) {
    const { customer, realtor, tourDate, tourTime } = tour;

    await TourNotificationManager.processNotification(
      customer,
      realtor,
      tourDate,
      tourTime
    );
  }

  await TourNotificationManager.retryFailed();

  return TourNotificationManager.getCronLog();
};

module.exports = TourNotification;
