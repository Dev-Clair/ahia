import IOffering from "./IOffering";
import IInstalment from "./IInstalment";
import IOutright from "./IOutright";

export default interface ISellOffering extends IOffering {
  status: "now-selling" | "sold";
  sell: {
    outright: IOutright;
    instalment?: [IInstalment];
  };
}
