const Listing = require("./listingModel");

const ListingGenerator = async function* () {
  const pageSize = 100;

  let pageNumber = 0;

  let iterationCount = 0;

  let totalRetrieved = 0;

  while (true) {
    const listings = await Listing.find({
      reference: {
        status: "pending",
        expiry: { $lte: new Date() },
      },
    })
      .skip(pageNumber * pageSize)
      .limit(pageSize);

    if (listings.length === 0 || !listings) {
      console.log("No listing transactions are pending at the moment");
      break;
    }

    const now = new Date().getTime();

    for (const listing of listings) {
      const { _id, name, provider, reference } = listing;

      const expiry = new Date(reference.expiry).getTime();

      const diff = expiry - now;

      if (diff > 0) {
        yield {
          id: _id,
          name,
          provider,
          reference,
        };
      }
    }

    totalRetrieved += listings.length;

    iterationCount++;

    pageNumber++;

    console.log(`Retrieved ${totalRetrieved} listings on ${iterationCount}`);
  }
};

module.exports = ListingGenerator;