const Tour = require("../src/model/tourModel");

const TourGenerator = async function* () {
  const pageSize = 100;

  let pageNumber = 0;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const tours = await Tour.find({
      schedule: { date: { $gte: new Date() } },
      status: "pending",
    })
      .skip(pageNumber * pageSize)
      .limit(pageSize);

    if (tours.length === 0 || !tours) {
      console.log("No tours are scheduled at the moment");
      break;
    }

    const now = new Date().getTime();

    for (const tour of tours) {
      const { _id, name, customer, realtor } = tour;

      const scheduledDate = tour.schedule.date;

      const scheduledTime = tour.schedule.time;

      const tourDateTime = new Date(scheduledDate);

      tourDateTime.setHours(parseInt(scheduledTime.split(":")[0], 10));

      tourDateTime.setMinutes(parseInt(scheduledTime.split(":")[1], 10));

      const diff = tourDateTime.getTime() - now;

      if (diff <= 6 * 60 * 60 * 1000 && diff > 0) {
        yield {
          name,
          customer,
          realtor,
          tourId: _id,
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

module.exports = TourGenerator;
