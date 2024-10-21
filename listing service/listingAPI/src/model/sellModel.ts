import Product from "./productModel";
import ISellProduct from "../interface/ISellproduct";
import SellProductSchema from "../schema/sellproductSchema";

const Sell = Product.discriminator<ISellProduct>("Sell", SellProductSchema);

export default Sell;
