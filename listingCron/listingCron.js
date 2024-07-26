const ListingGenerator = require("./listingGenerator");
const ListingCronManager = require("./listingCronManager");

const ListingCron = async () => {
  const listingGenerator = ListingGenerator();

  for await (const listing of listingGenerator) {
    const { name, provider, reference } = listing;

    await ListingCronManager.processNotification(name, provider, reference);
  }

  return ListingCronManager.getCronLog();
};

module.exports = ListingCron;
