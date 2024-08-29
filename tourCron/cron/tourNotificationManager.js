const URL = require("node:url").URL;
const Config = require("../config");
const Mail = require("../src/utils/mail");
const MailerError = require("../src/error/mailerError");

async function TourNotificationManager(
  name,
  customer,
  realtor,
  tourId,
  tourDate,
  tourTime
) {
  let customerEmail = customer.email;

  let realtorEmail = realtor.email;

  const sender = Config.TOUR_NOTIFICATION_EMAIL || "";

  try {
    if (!customerEmail) {
      throw new Error(`Email not found for customer: ${customer.id}`);
    }

    if (!realtorEmail) {
      throw new Error(`Email not found for realtor: ${realtor.id}`);
    }

    const subject = `TOUR REMINDER: ${name}`;

    const link = URL(`https://www.ahia.com/tours/${tourId}/reschedule`);

    const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.\n\nTo reschedule, kindly click the ${link} to initiate the rescheduling process.\nPlease note that rescheduling a tour is subject to the tour party approval and you might incur a penalty fee if initiated 3-Hrs before the scheduled time.`;

    await Mail(sender, [customerEmail, realtorEmail], subject, text);
  } catch (err) {
    if (err instanceof MailerError) {
      throw err;
    }
  }
}

module.exports = TourNotificationManager;
