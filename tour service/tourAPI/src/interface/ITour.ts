import IDocument from "./IDocument";

export default interface ITour extends IDocument {
  name: string;
  customer: string;
  realtor: string;
  offerings: string[];
  schedule: {
    date: string;
    time: string;
  };
  status: "pending" | "ongoing" | "completed" | "cancelled";
  isClosed: boolean;
}
