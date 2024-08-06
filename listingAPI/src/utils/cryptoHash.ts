import { createHmac } from "node:crypto";
import Config from "../../config";

/**
 * Creates a cryptographically secure hash of a secret
 * @param secret
 * @returns Promise<string>
 */
const CryptoHash = (secret: string): Promise<string> => {
  return new Promise((resolve) => {
    resolve(
      createHmac("sha256", Config.APP_SECRET).update(secret).digest("hex")
    );
  });
};

export default CryptoHash;
