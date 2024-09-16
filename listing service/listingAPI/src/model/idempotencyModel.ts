import { model } from "mongoose";
import IdempotencySchema from "../schema/idempotencySchema";
import IIdempotency from "../interface/IIdempotency";

const Idempotency = model<IIdempotency>("Idempotency", IdempotencySchema);

export default Idempotency;
