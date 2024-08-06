import Config from "../../config";
import CryptoHash from "../utils/cryptoHash";
import HttpStatusCode from "../enum/httpStatusCode";
import UnauthorisedError from "../error/unauthorizedError";

/**
 * Verifies if user has required permissions to access a resource
 * @param hashedRole
 * @param expectedRole
 * @returns Promise<boolean|Unauthorized>
 */
const VerifyRole = async (
  hashedRole: string,
  expectedRole: string
): Promise<boolean | UnauthorisedError> => {
  const expectedHash = await CryptoHash(expectedRole, Config.APP_SECRET);

  if (hashedRole === expectedHash) {
    return true;
  }

  throw new UnauthorisedError(
    HttpStatusCode.UNAUTHORISED,
    "Unathorized!\nPermission Denied",
    false,
    "login"
  );
};

export default VerifyRole;
