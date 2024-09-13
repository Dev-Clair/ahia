import { Document } from "mongoose";
import IOffering from "./IOffering";

export default interface OfferingInterface extends IOffering, Document {}
