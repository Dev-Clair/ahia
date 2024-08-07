import Config from "../../config";
import CryptoHash from "../utils/cryptoHash";

/**
 * Verifies if user has required permissions to access a resource
 * @param hashedRole
 * @param expectedRole
 * @returns Promise<boolean>
 */
const VerifyRole = async (
  hashedRole: string,
  expectedRole: string
): Promise<boolean> => {
  const expectedHash = await CryptoHash(expectedRole, Config.APP_SECRET);

  return hashedRole === expectedHash;
};

export default VerifyRole;
