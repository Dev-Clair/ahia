const MapCache = require("../service/cache");
const Mail = require("../service/mailer");
const Notify = require("./notify");
const Retry = require("./retry");

const failureCache = new MapCache();

class TourNotificationTransactionManager {
  static async processTourNotification(customer, realtor, tourDate, tourTime) {
    let customerEmail = customer.email;

    let realtorEmail = realtor.email;

    try {
      if (!customerEmail) {
        throw new Error(`Email not found for customer: ${customer.id}`);
      }

      if (!realtorEmail) {
        throw new Error(`Email not found for realtor: ${realtor.id}`);
      }
      const from = process.env.TOUR_NOFICATION_EMAIL || "";

      const subject = "Tour Reminder";

      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.`;

      await Retry.LinearJitterRetry(() =>
        Mail(from, [customerEmail], subject, text, "", [realtorEmail])
      );
    } catch (err) {
      console.error(
        `Failed to process notification for customer ${customer.id} and realtor ${realtor.id}: ${err.message}`
      );

      const from = process.env.TOUR_NOTIFICATION_EMAIL || "";

      const to = process.env.TOUR_ADMIN_EMAIL_I || "";

      const subject = "NOTIFICATION ERROR";

      const text = `Failed to process notification for customer ${customer.id} and realtor ${realtor.id}: ${err.message}`;

      await Notify(from, to, subject, text);

      failureCache.set(customer.id, {
        customerEmail: customer.email,
        realtorEmail: realtor.email,
        tourDate: tourDate,
        tourTime: tourTime,
      });
    }
  }

  static async retryFailureCache() {
    let retriedCount = 0;

    for (const [key, value] of failureCache.entries()) {
      await this.processTourNotification(
        value.customerEmail,
        value.realtorEmail,
        value.tourDate,
        value.tourTime
      );

      retriedCount++;

      failureCache.delete(key);
    }

    return retriedCount;
  }
}

module.exports = TourNotificationTransactionManager;
