import { model } from "mongoose";
import IOffering from "../interface/IOffering";
import OfferingInterfaceType from "../type/offeringinterfaceType";
import OfferingSchema from "../schema/offeringSchema";

const Offering = model<IOffering, OfferingInterfaceType>(
  "Offering",
  OfferingSchema
);

export default Offering;
