import ForbiddenError from "../error/forbiddenError";
import HttpStatusCode from "../enum/httpStatusCode";

async function isGranted(role: string) {
  if (!role) {
    throw new ForbiddenError(HttpStatusCode.FORBIDDEN, "Action Forbidden");
  }
}
