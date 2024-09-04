import { createHmac } from "node:crypto";

/**
 * Creates and verifies cryptographically secure hashes
 */
class SecretManager {
  /**
   * Creates a cryptographically secure hash of a value with sha256 algorithm and a (user-defined) secret key
   * @param value
   * @param key
   * @returns Promise<string>
   */
  static async HashSecret(value: string, key: string): Promise<string> {
    return new Promise((resolve) => {
      resolve(createHmac("sha256", key).update(value).digest("hex"));
    });
  }

  /**
   * Verifies a hashed secret by comparing it with the rehashed value and key
   * @param secret
   * @param value
   * @param key
   * @returns Promise<string>
   */
  static async VerifySecret(
    secret: string,
    value: string,
    key: string
  ): Promise<boolean> {
    const hashedValue = await this.HashSecret(value, key);

    return secret === hashedValue;
  }
}

export default SecretManager;
