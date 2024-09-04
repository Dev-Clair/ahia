const TourGenerator = require("./tourGenerator");
const TourNotificationManager = require("./tourNotificationManager");

const TourNotification = async () => {
  const tourGenerator = TourGenerator();

  for await (const tour of tourGenerator) await TourNotificationManager(tour);
};

module.exports = TourNotification;
