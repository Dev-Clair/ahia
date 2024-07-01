import MapCache from "./src/service/cacheService";
import RetryHandler from "./src/utils/retryHandler/retryHandler";
import SendEmail from "./src/service/mailService";
import getUserEmail from "./src/utils/getUserEmail";

const emailCache = new MapCache();

const failureCache = new MapCache();

class TourNotificationProcessManager {
  static async processTourNotification(
    customerId: string,
    realtorId: string,
    tourDate: Date,
    tourTime: string
  ) {
    let customerEmail: string = emailCache.get(customerId);
    let realtorEmail: string = emailCache.get(realtorId);

    try {
      if (!customerEmail) {
        customerEmail = await RetryHandler.ExponentialRetry(() =>
          getUserEmail(customerId)
        );
        emailCache.set(customerId, customerEmail);
      }

      if (!realtorEmail) {
        realtorEmail = await RetryHandler.ExponentialRetry(() =>
          getUserEmail(realtorId)
        );
        emailCache.set(realtorId, realtorEmail);
      }

      const subject = "Tour Reminder";
      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.`;

      await RetryHandler.LinearJitterRetry(() =>
        SendEmail("", [customerEmail], subject, text, "", [realtorEmail])
      );
    } catch (err: any) {
      console.error(
        `Failed to process transaction for customer ${customerId} and realtor ${realtorId}: ${err.message}`
      );
      failureCache.set(customerId, {
        customerId,
        realtorId,
        tourDate,
        tourTime,
      });
    }
  }

  static async processFailureCache() {
    for (const [
      customerId,
      { customerId: cid, realtorId, tourDate, tourTime },
    ] of failureCache.entries()) {
      await this.processTourNotification(cid, realtorId, tourDate, tourTime);
      failureCache.delete(customerId);
    }
  }
}

export default TourNotificationProcessManager;
