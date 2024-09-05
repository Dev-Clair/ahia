import Listing from "./listingModel";
import SellSchema from "../schema/sellSchema";
import SellInterface from "../interface/sellInterface";

const Sell = Listing.discriminator<SellInterface>("Sell", SellSchema);

export default Sell;
