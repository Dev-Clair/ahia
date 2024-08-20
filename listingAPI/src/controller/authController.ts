import Config from "../../config";
import SecretManager from "../utils/secretManager";

/**
 * Verifies if user has required permissions to access a resource
 * @param hash
 * @param secret
 * @returns Promise<boolean>
 */
const VerifyRole = async (hash: string, value: string): Promise<boolean> => {
  return await SecretManager.VerifySecret(hash, value, Config.APP_SECRET);
};

export default VerifyRole;
