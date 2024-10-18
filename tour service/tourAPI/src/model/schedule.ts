import { model } from "mongoose";
import ScheduleSchema from "../schema/scheduleSchema";
import ISchedule from "../interface/ISchedule";

const Schedule = model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;
