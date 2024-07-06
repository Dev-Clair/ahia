const MapCache = require("./cache");
const Notify = require("./notify");

class TourNotificationManager {
  processedCount = 0;

  failedCount = 0;

  retriedCount = 0;

  failureCache = new MapCache();

  static async processNotification(customer, realtor, tourDate, tourTime) {
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

      const link = "";

      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.\nTo reschedule kindly click the ${link} to reschedule the tour`;

      await Notify(sender, [customerEmail, realtorEmail], subject, text);

      processedCount++;
    } catch (err) {
      console.error(
        `Failed to process tour notification to customer ${customer.id} and realtor ${realtor.id}\nError: ${err.message}`
      );

      const recipient = process.env.TOUR_ADMIN_EMAIL_I || "";

      const subject = "NOTIFICATION ERROR";

      const text = `Failed to process tour notification to customer ${customer.id} and realtor ${realtor.id}\nError: ${err.message}`;

      await Notify(sender, recipient, subject, text);

      failureCache.set(customer.id, {
        customerEmail: customer.email,
        realtorEmail: realtor.email,
        tourDate: tourDate,
        tourTime: tourTime,
      });

      failedCount++;
    }
  }

  static async retryFailed() {
    for (const [key, value] of failureCache.entries()) {
      await this.processNotification(
        value.customerEmail,
        value.realtorEmail,
        value.tourDate,
        value.tourTime
      );

      failureCache.delete(key);

      this.retriedCount;
    }
  }

  static getCronLog() {
    return {
      Notifications: {
        processed: processedCount,
        failed: failedCount,
        retried: retriedCount,
        status: failedCount === retriedCount,
      },
    };
  }
}

module.exports = TourNotificationManager;
