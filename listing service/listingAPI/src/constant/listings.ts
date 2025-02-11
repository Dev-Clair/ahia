const PROJECTION: string[] = [
  "name",
  "description",
  "type",
  "products",
  "location",
  "provider",
  "media",
  "verification",
  // "createdAt",
  // "-updatedAt",
  // "-__v",
];

const SORT: string[] = ["-createdAt"];

const LISTING = { PROJECTION: PROJECTION, SORT: SORT };

export default LISTING;
