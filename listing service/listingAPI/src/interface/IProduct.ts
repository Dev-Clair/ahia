import ProductTypes from "../constant/productTypes";

export default interface IProduct {
  name: keyof typeof ProductTypes;
  category: "economy" | "premium" | "luxury";
  type: (typeof ProductTypes)[IProduct["name"]][number];
}
