import { createHmac } from "node:crypto";

/**
 * Creates a cryptographically secure hash of a secret and key
 * @param secret
 * @param key
 * @returns Promise<string>
 */
const CryptoHash = (secret: string, key: string): Promise<string> => {
  return new Promise((resolve) => {
    resolve(createHmac("sha256", key).update(secret).digest("hex"));
  });
};

export default CryptoHash;
