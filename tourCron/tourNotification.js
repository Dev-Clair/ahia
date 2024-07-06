const Tour = require("./tourModel");
const TourNotificationManager = require("./tourNotificationManager");

const retrieveToursGenerator = async function* () {
  const pageSize = 100;

  let pageNumber = 0;

  let iterationCount = 0;

  let retrievedCount = 0;

  while (true) {
    const tours = await Tour.find({
      scheduledDate: { $gte: new Date() },
      status: "pending",
    })
      .skip(pageNumber * pageSize)
      .limit(pageSize);

    if (tours.length === 0 || !tours) {
      console.log("No tours are scheduled at the moment.");
      break;
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

    totalRetrieved += tours.length;

    iterationCount++;

    pageNumber++;

    console.log(`Retrieved ${totalRetrieved} tours on ${iterationCount}`);
  }
};

const TourNotification = async () => {
  let retrievedCount = 0;

  let failedCount = 0;

  let retriedCount = 0;

  const toursGenerator = retrieveToursGenerator();

  for await (const tour of toursGenerator) {
    const { customer, realtor, tourDate, tourTime } = tour;

    try {
      await TourNotificationManager.processTourNotification(
        customer,
        realtor,
        tourDate,
        tourTime
      );
      retrievedCount++;
    } catch (err) {
      console.error(`Error processing tour notification: ${err.message}`);

      failedCount++;
    }
  }

  try {
    retriedCount = await TourNotificationManager.retryFailureCache();
  } catch (err) {
    console.error(`Error retrying failed notifications: ${err.message}`);
  }

  return {
    retrievedTours: retrievedCount,
    failed: failedCount,
    retried: retriedCount,
  };
};

module.exports = TourNotification;
