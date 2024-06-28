import axios from "axios";
import TourModel from "../src/model/tourModel";
import MapCache from "../src/service/cacheService";
import SendEmail from "../src/service/mailService";
import retryHandler from "../src/utils/retryHandler/retryHandler";

const getUserEmail = async (userId: string) => {
  return "";
};

const emailCache = new MapCache();

const retrieveTours = async () => {
  // const tours = await TourModel.find({
  //   scheduledDate: { $gte: new Date() },
  //   status: "pending",
  // });
  // for (const tour of tours) {
  //   const { realtorId, customerId, scheduledDate, scheduledTime } = tour;
  //   const now = Date.now();
  //   const tourDate = scheduledDate;
  //   const diff = tourDate - now;
  //   if (diff <= 6 * 60 * 60 * 1000) {
  //     return {
  //       customerId: customerId,
  //       realtorId: realtorId,
  //       tourDate: scheduledDate,
  //       tourTime: scheduledTime,
  //     };
  //   }
  //   return;
  // }
};

const sendTourNotification = async () => {
  console.log(__filename);
  // const { customerId, realtorId, tourDate, tourTime } = retrieveTours();
  // let customerEmail = emailCache.get(customerId);
  // let realtorEmail = emailCache.get(realtorId);
  // if (!customerEmail) {
  //   customerEmail = await getUserEmail(customerId);
  //   emailCache.set(customerId, customerEmail);
  // }
  // if (!realtorEmail) {
  //   realtorEmail = await getUserEmail(realtorId);
  //   emailCache.set(realtorId, realtorEmail);
  // }
  // const subject = "Tour Reminder";
  // const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.`;
  // return ExponentialRetry(
  //   SendEmail(customerEmail, subject, text, realtorEmail)
  // );
};

sendTourNotification();
