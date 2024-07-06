import IAM from "./iamModel";
import AdminSchema from "../schema/adminSchema";
import AdminInterface from "../interface/adminInterface";

const Admin = IAM.discriminator<AdminInterface>("Admin", AdminSchema);

export default Admin;
