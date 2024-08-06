import CryptoHash from "../utils/cryptoHash";

/**
 * Verify if user has required permissions to acess a resource
 * @param hashedRole
 * @param expectedRole
 * @returns Promise<boolean>
 */
const VerifyRole = async (
  hashedRole: string,
  expectedRole: string
): Promise<boolean> => {
  const expectedHash = await CryptoHash(expectedRole);

  if (hashedRole !== expectedHash) {
    return false;
  }

  return true;
};

export default VerifyRole;
