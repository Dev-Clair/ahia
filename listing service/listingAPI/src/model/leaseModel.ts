import Listing from "./listingModel";
import ILease from "../interface/ILease";
import LeaseSchema from "../schema/leaseSchema";

const Lease = Listing.discriminator<ILease>("Lease", LeaseSchema);

export default Lease;
