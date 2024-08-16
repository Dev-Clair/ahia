const { createHmac } = require("node:crypto");

/**
 * Creates a cryptographically secure hash of a value/secret with an algorithm and key
 * @param secret
 * @param key
 * @returns Promise<string>
 */
const CryptoHash = (secret, key) => {
  return new Promise((resolve) => {
    resolve(createHmac("sha256", key).update(secret).digest("hex"));
  });
};

export default CryptoHash;
