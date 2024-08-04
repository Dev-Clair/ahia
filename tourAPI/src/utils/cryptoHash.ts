import { createHash } from "node:crypto";

const CryptoHash = (secret: string): Promise<string> => {
  return new Promise((resolve) => {
    resolve(createHash("sha256").update(secret).digest("hex"));
  });
};

export default CryptoHash;
