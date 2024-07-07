const URL = require("node:url").URL;
const Cache = require("./cache");
const MailerError = require("./mailerError");
const Notify = require("./notify");

class TourNotificationManager {
  constructor() {
    this.successCount = 0;

    this.failedCount = 0;

    this.errorCache = new Cache.SetCache();
  }

  static async processNotification(
    customer,
    realtor,
    tourId,
    tourDate,
    tourTime
  ) {
    let customerEmail = customer.email;

    let realtorEmail = realtor.email;

    const sender = process.env.TOUR_NOTIFICATION_EMAIL || "";

    try {
      if (!customerEmail) {
        throw new Error(`Email not found for customer: ${customer.id}`);
      }

      if (!realtorEmail) {
        throw new Error(`Email not found for realtor: ${realtor.id}`);
      }

      const subject = "TOUR REMINDER";

      const link = URL(
        `https://wwww.ahia.com/api/v1/tours/${tourId}/reschedule`
      );

      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.\n\nTo reschedule, kindly click the ${link} to initiate the rescheduling process.\nPlease note that rescheduling a tour is subject to the tour party approval and automatically becomes impossible 3-Hrs before the original scheduled time.`;

      await Notify(sender, [customerEmail, realtorEmail], subject, text);

      this.successCount++;
    } catch (err) {
      if (err instanceof MailerError) {
        throw err;
      }

      errorCache.set(
        tourId,
        `Failed to process tour notification for tour ${tourId}\nError: ${err.message}`
      );

      this.failedCount++;
    }
  }

  static getCronLog() {
    return {
      log: {
        success: this.successCount,
        failed: this.failedCount,
      },
      status: errorCache.size() === 0,
      error: {
        count: errorCache.size(),
        errors: errorCache.entries(),
      },
    };
  }
}

module.exports = TourNotificationManager;
