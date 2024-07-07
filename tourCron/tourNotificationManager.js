const URL = require("node:url").URL;
const Cache = require("./cache");
const MailerError = require("./mailerError");
const Notify = require("./notify");

class TourNotificationManager {
  constructor() {
    this.processedCount = 0;

    this.failedCount = 0;

    this.retriedCount = 0;

    this.failureCache = new Cache.MapCache();

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

      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.\n\nKindly click the ${link} to reschedule the tour to a more convienient date or time to inform the other party earlier.\nPlease note that rescheduling a tour becomes impossible 3-Hrs before the scheduled time.`;

      await Notify(sender, [customerEmail, realtorEmail], subject, text);

      this.processedCount++;
    } catch (err) {
      if (err instanceof MailerError) {
        throw err;
      }

      const recipient = process.env.TOUR_ADMIN_EMAIL_I || "";

      const subject = "CRON NOTIFICATION ERROR";

      const text = `Failed to process tour notification for tour ${tourId}\nError: ${err.message}`;

      await Notify(sender, recipient, subject, text);

      failureCache.set(customer.id, {
        customerEmail: customer.email,
        realtorEmail: realtor.email,
        tourId: tourId,
        tourDate: tourDate,
        tourTime: tourTime,
      });

      errorCache.set(tourId, text);

      this.failedCount++;
    }
  }

  static async retryFailed() {
    for (const [key, value] of failureCache.entries()) {
      await this.processNotification(
        value.customerEmail,
        value.realtorEmail,
        value.tourId,
        value.tourDate,
        value.tourTime
      );

      failureCache.delete(key);

      this.retriedCount++;
    }
  }

  static getCronLog() {
    return {
      log: {
        processed: this.processedCount,
        failed: this.failedCount,
        retried: this.retriedCount,
        status: this.failedCount === this.retriedCount,
        errors: errorCache.entries(),
      },
    };
  }
}

module.exports = TourNotificationManager;
