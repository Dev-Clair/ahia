import IOffering from "./IOffering";
import IRent from "./IRent";

export default interface ILeaseOffering extends IOffering {
  lease: [IRent];
}
