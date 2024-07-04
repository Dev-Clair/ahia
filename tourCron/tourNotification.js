const Tour = require("./tourModel");
const TourNotificationManager = require("./tourNotificationManager");

async function* retrieveToursGenerator() {
  const tours = await Tour.find({
    scheduledDate: { $gte: new Date() },
    status: "pending",
  });

  if (!tours) {
    return console.log("No scheduled tours yet");
  }

  const now = new Date().getTime();

  for (const tour of tours) {
    const { realtor, customer, scheduledDate, scheduledTime } = tour;

    const tourDateTime = new Date(scheduledDate);

    tourDateTime.setHours(parseInt(scheduledTime.split(":")[0], 10));

    tourDateTime.setMinutes(parseInt(scheduledTime.split(":")[1], 10));

    const diff = tourDateTime.getTime() - now;

    if (diff <= 6 * 60 * 60 * 1000 && diff > 0) {
      yield {
        customer,
        realtor,
        tourDate: scheduledDate,
        tourTime: scheduledTime,
      };
    }
  }
}

const TourNotification = async () => {
  const toursGenerator = retrieveToursGenerator();

  for await (const tour of toursGenerator) {
    const { customer, realtor, tourDate, tourTime } = tour;

    await TourNotificationManager.processTourNotification(
      customer.email,
      realtor.email,
      tourDate,
      tourTime
    );
  }

  await TourNotificationManager.retryFailureCache();
};

module.exports = TourNotification;
