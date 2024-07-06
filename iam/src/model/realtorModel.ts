import IAM from "./iamModel";
import RealtorSchema from "../schema/realtorSchema";
import RealtorInterface from "../interface/realtorInterface";

const Realtor = IAM.discriminator<RealtorInterface>("Realtor", RealtorSchema);

export default Realtor;
