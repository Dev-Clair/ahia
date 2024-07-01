import TourModel from "../src/model/tourModel";
import TourNotificationProcessManager from "../tourNotificationProcessManager";

async function* retrieveToursGenerator() {
  const tours = await TourModel.find({
    scheduledDate: { $gte: new Date() },
    status: "pending",
  });

  const now = new Date().getTime();

  for (const tour of tours) {
    const { realtorId, customerId, scheduledDate, scheduledTime } = tour;

    const tourDateTime = new Date(scheduledDate);

    tourDateTime.setHours(parseInt(scheduledTime.split(":")[0], 10));

    tourDateTime.setMinutes(parseInt(scheduledTime.split(":")[1], 10));

    const diff = tourDateTime.getTime() - now;

    if (diff <= 6 * 60 * 60 * 1000 && diff > 0) {
      yield {
        customerId,
        realtorId,
        tourDate: scheduledDate,
        tourTime: scheduledTime,
      };
    }
  }
}

const sendTourNotification = async () => {
  const toursGenerator = retrieveToursGenerator();

  for await (const tour of toursGenerator) {
    const { customerId, realtorId, tourDate, tourTime } = tour;

    await TourNotificationProcessManager.processTourNotification(
      customerId,
      realtorId,
      tourDate,
      tourTime
    );
  }

  await TourNotificationProcessManager.retryFailureCache();
};

sendTourNotification();
