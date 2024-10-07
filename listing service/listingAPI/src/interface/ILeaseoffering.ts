import ILease from "./ILease";
import IOffering from "./IOffering";

export default interface ILeaseOffering extends IOffering {
  status: "now-letting" | "closed";
  lease: [ILease];
}
