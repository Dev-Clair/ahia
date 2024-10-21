import IProduct from "./IProduct";
import IInstalment from "./IInstalment";
import IOutright from "./IOutright";

export default interface ISellProduct extends IProduct {
  status: "now-selling" | "sold";
  sell: {
    outright: IOutright;
    instalment?: [IInstalment];
  };
}
