const Tour = require("../src/model/tourModel");

const TourGenerator = async function* () {
  const limit = 100;

  let skip = 0;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const tours = await Tour.find({
      schedule: { date: { $gte: new Date() } },
      status: "pending",
      isClosed: false,
    })
      .skip(skip * limit)
      .limit(limit);

    if (tours.length === 0 || !tours) {
      console.log("No tours are scheduled at the moment");
      break;
    }

    const now = new Date().getTime();

    for (const tour of tours) {
      const scheduledDate = tour.schedule.date;

      const scheduledTime = tour.schedule.time;

      const tourDateTime = new Date(scheduledDate);

      tourDateTime.setHours(parseInt(scheduledTime.split(":")[0], 10));

      tourDateTime.setMinutes(parseInt(scheduledTime.split(":")[1], 10));

      const diff = tourDateTime.getTime() - now;

      if (diff <= 12 * 60 * 60 * 1000 && tour.realtor) {
        yield tour;
      }
    }

    totalRetrieved += tours.length;

    iterationCount++;

    skip++;

    console.log(`Retrieved ${totalRetrieved} tours on ${iterationCount}`);
  }
};

module.exports = TourGenerator;
