const TourGenerator = require("./cron/tourGenerator");
const TourNotificationManager = require("./tourNotificationManager");

const TourNotification = async () => {
  const tourGenerator = TourGenerator();

  for await (const tour of tourGenerator) {
    const { name, customer, realtor, tourId, tourDate, tourTime } = tour;

    await TourNotificationManager(
      name,
      customer,
      realtor,
      tourId,
      tourDate,
      tourTime
    );
  }
};

module.exports = TourNotification;
