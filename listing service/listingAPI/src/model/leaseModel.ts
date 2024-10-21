import Product from "./productModel";
import ILeaseProduct from "../interface/ILeaseproduct";
import LeaseProductSchema from "../schema/leaseproductSchema";

const Lease = Product.discriminator<ILeaseProduct>("Lease", LeaseProductSchema);

export default Lease;
