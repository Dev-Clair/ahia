import ILease from "./ILease";
import IProduct from "./IProduct";

export default interface ILeaseProduct extends IProduct {
  lease: [ILease];
}
