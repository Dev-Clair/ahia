import ProductTypes from "../constant/productTypes";

export default interface IProduct {
  name: keyof typeof ProductTypes;
  type: (typeof ProductTypes)[IProduct["name"]][number];
}
