import ILease from "./ILease";
import IProduct from "./IProduct";

export default interface ILeaseProduct extends IProduct {
  status: "now-letting" | "closed";
  lease: [ILease];
}
