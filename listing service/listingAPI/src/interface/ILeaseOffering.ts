import IOffering from "./IOffering";
import IRent from "./ILease";

export default interface ILeaseOffering extends IOffering {
  lease: [IRent];
}
