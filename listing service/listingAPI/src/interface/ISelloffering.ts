import IOffering from "./IOffering";
import ISale from "./ISale";

export default interface ISellOffering extends IOffering {
  isNegotiable?: boolean;
  sell: [ISale];
}
