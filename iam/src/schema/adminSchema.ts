import { Schema } from "mongoose";
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

export default AdminSchema;
