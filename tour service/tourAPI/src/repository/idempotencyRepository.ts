import { ClientSession } from "mongoose";
import Idempotency from "../model/idempotencyModel";

/**
 * Idempotency Repository
 * @method find
 * @method save
 */
export default class IdempotencyRepository {
  /**
   * Verifies operation idempotency
   * @param key idempotency key
   * @param session database session (optional)
   */
  static async find(
    key: string,
    session: ClientSession | null
  ): Promise<boolean> {
    return (await Idempotency.findOne({ key: key })?.session(session))
      ? true
      : false;
  }

  /**
   * Saves operation idempotency key
   * @param key idempotency key
   * @param session database session
   */
  static async save(
    payload: Record<string, any>,
    session: ClientSession
  ): Promise<void> {
    const verifyKey = await this.find(payload.key, session);

    if (!verifyKey) await Idempotency.create([payload], { session });
  }
}
