const URL = require("node:url").URL;
const Cache = require("./cache");
const Config = require("./config");
const Mail = require("./mail");
const MailerError = require("./mailerError");

class TourNotificationManager {
  constructor() {
    this.successCount = 0;

    this.failedCount = 0;

    this.errorCache = new Cache.SetCache();
  }

  static async processNotification(
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

      const link = URL(
        `https://www.ahia.com/api/v1/tours/${tourId}/reschedule`
      );

      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.\n\nTo reschedule, kindly click the ${link} to initiate the rescheduling process.\nPlease note that rescheduling a tour is subject to the tour party approval and you might incur a penalty fee if initiated 3-Hrs before the scheduled time.`;

      await Mail(sender, [customerEmail, realtorEmail], subject, text);

      this.successCount++;
    } catch (err) {
      if (err instanceof MailerError) {
        throw err;
      }

      errorCache.set(
        tourId,
        `Failed to process tour notification for tour:\nName:${name}\nId:${tourId}\nError: ${err.message}`
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
