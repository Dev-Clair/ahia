import Listing from "./listingModel";
import LeaseSchema from "../schema/leaseSchema";
import LeaseInterface from "../interface/leaseInterface";

const Lease = Listing.discriminator<LeaseInterface>("Lease", LeaseSchema);

export default Lease;
