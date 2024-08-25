import Config from "../../config";
import SecretManager from "../utils/secretManager";

/**
 * Verifies if user has required permissions to access a resource
 * @param hashedRole
 * @param expectedRole
 * @returns Promise<boolean>
 */
const VerifyUserRole = async (
  hashedRole: string,
  expectedRole: string
): Promise<boolean> => {
  const expectedHash = await SecretManager.HashSecret(
    expectedRole,
    Config.APP_SECRET
  );

  return hashedRole === expectedHash;
};

export default VerifyUserRole;
