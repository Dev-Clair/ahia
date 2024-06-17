import { Schema } from "mongoose";
import IAM from "./iamModel";
import AdminInterface from "../interface/adminInterface";

const AdminSchema: Schema<AdminInterface> = new Schema({
  permissions: [
    {
      type: String,
      trim: true,
      required: false,
    },
  ],
});

const Admin = IAM.discriminator<AdminInterface>("Admin", AdminSchema);

export default Admin;
