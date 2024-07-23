const TourGenerator = require("./tourGenerator");
const TourNotificationManager = require("./tourNotificationManager");

const TourNotification = async () => {
  const tourGenerator = TourGenerator();

  for await (const tour of tourGenerator) {
    const { name, customer, realtor, tourId, tourDate, tourTime } = tour;

    await TourNotificationManager.processNotification(
      name,
      customer,
      realtor,
      tourId,
      tourDate,
      tourTime
    );
  }

  return TourNotificationManager.getCronLog();
};

module.exports = TourNotification;
