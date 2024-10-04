import IOffering from "./IOffering";
import ISale from "./ISale";

export default interface ISellOffering extends IOffering {
  status: "now-selling" | "sold";
  sell: [ISale];
}
