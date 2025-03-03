const PROJECTION: string[] = [
  "name",
  "description",
  "type",
  "products",
  "provider",
  "media",
  "verification",
  // "-location",
  // "-address",
  "-createdAt",
  "-updatedAt",
  "-__v",
];

const SORT: string[] = ["-createdAt"];

const LISTING = { PROJECTION: PROJECTION, SORT: SORT };

export default LISTING;
