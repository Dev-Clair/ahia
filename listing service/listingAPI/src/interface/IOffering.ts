import Offerings from "../constant/offerings";

export default interface IOffering {
  name: keyof typeof Offerings;
  category: "economy" | "premium" | "luxury";
  features: string[];
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  quantity: number;
  type: (typeof Offerings)[IOffering["name"]][number];
}
