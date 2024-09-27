import Offering from "./offeringModel";
import ILeaseOffering from "../interface/ILeaseoffering";
import LeaseOfferingSchema from "../schema/leaseofferingSchema";

const Lease = Offering.discriminator<ILeaseOffering>(
  "Lease",
  LeaseOfferingSchema
);

export default Lease;
