import { model } from "mongoose";
import IProduct from "../interface/IProduct";
import ProductSchema from "../schema/productSchema";

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
