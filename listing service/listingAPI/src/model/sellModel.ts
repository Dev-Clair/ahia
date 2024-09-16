import Listing from "./listingModel";
import ISell from "../interface/ISell";
import SellSchema from "../schema/sellSchema";

const Sell = Listing.discriminator<ISell>("Sell", SellSchema);

export default Sell;
