import ProductTypes from "../constant/productTypes";

export default interface IProduct {
  name: keyof typeof ProductTypes;
  category: "economy" | "premium" | "luxury";
  features: string[];
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  quantity: number;
  type: (typeof ProductTypes)[IProduct["name"]][number];
}
