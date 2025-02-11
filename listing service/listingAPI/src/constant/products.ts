const PROJECTION: string[] = [
  "listing",
  "name",
  "description",
  "offering",
  "type",
  " media",
  "status",
  "lease|reservation|sell",
  // "-verification",
  // "createdAt",
  // "-updatedAt",
  // "-__v",
];

const SORT: string[] = ["-createdAt"];

const PRODUCT = { PROJECTION: PROJECTION, SORT: SORT };

export default PRODUCT;
