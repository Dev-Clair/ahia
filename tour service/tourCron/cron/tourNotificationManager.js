const URL = require("node:url").URL;
const Config = require("../config");
const Mail = require("../src/utils/mail");

async function TourNotificationManager(tour) {
  const { _id, name, customer, realtor, schedule } = tour;

  const sender = Config.TOUR_NOTIFICATION_EMAIL || "";

  const recipient = [customer.email, realtor.email];

  const subject = `TOUR REMINDER: ${name}`;

  const tourDate = schedule.date;

  const tourTime = schedule.time;

  const link = URL(`https://www.ahia.com/tours/${_id}/reschedule`);

  const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.\nTo reschedule, kindly click the ${link} to initiate the rescheduling process.\nKindly remember that rescheduling a tour is subject to the tour party approval`;

  await Mail(sender, recipient, subject, text).catch((err) => {
    throw err;
  });
}

module.exports = TourNotificationManager;
