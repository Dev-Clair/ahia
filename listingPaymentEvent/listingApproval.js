const Config = require("./config");
const DuplicateEventError = require("./src/error/duplicateevent");
const Idempotent = require("./src/utils/idempotent");
const Retry = require("./src/utils/retry");
const Listing = require("./src/model/listing");
const Secret = require("./src/utils/secret");

export const listingApproval = async (event) => {
  // const { serviceName, serviceSecret, payload } = event.detail;

  // let listingData;

  // if (serviceName === Config.LISTING.SERVICE.NAME)
  //   listingData = (await Secret.Verify(
  //     serviceSecret,
  //     Config.LISTING.SERVICE.SECRET,
  //     Config.APP_SECRET
  //   ))
  //     ? JSON.parse(payload)
  //     : null;

  // if (listingData === null)
  //   throw new Error(
  //     `Invalid service name: ${serviceName} and secret: ${serviceSecret}`
  //   );

  const { id, provider, paymentReference } = listingData;

  if (await Idempotent.Verify(paymentReference))
    throw new DuplicateEventError(
      `Duplicate event detected for payment reference: ${paymentReference}`
    );

  const session = await mongoose.startSession();

  const approveListingStatus = await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndUpdate(
      { _id: id },
      { $set: { status: { approved: true } } },
      { new: true, session }
    );

    if (!listing) throw new Error(`No record found for listing ${id}`);

    await Idempotent.Ensure(paymentReference, session);
  });

  await Retry.ExponentialJitterBackoff(() => approveListingStatus);
};
