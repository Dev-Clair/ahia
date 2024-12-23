import IDocument from "./IDocument";
import Offerings from "../constant/offerings";

export default interface IOffering extends IDocument {
  name: keyof typeof Offerings;
  category: "economy" | "premium" | "luxury" | "exclusive";
  features: string[];
  area: {
    size: number;
    unit: "sqm" | "sqft";
  };
  type: (typeof Offerings)[IOffering["name"]][number];
}
