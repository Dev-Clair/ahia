import Offering from "./offeringModel";
import ISellOffering from "../interface/ISelloffering";
import SellOfferingSchema from "../schema/sellofferingSchema";

const Sell = Offering.discriminator<ISellOffering>("Sell", SellOfferingSchema);

export default Sell;
