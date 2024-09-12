import NotFoundError from "../error/notfoundError";
import DocumentValueResolver from "../utils/documentResolver";
import IdempotencyManager from "../utils/idempotencyManager";

const getDocument = async (paramValue: string, serviceName: string) => {
  return await DocumentValueResolver.Create(paramValue, serviceName)
    .Resolve()
    .catch((err: Error | NotFoundError) => {
      throw err;
    });
};

const verifyIdempotencyKey = async (key: string): Promise<boolean> => {
  return await IdempotencyManager.Verify(key);
};

export default { getDocument, verifyIdempotencyKey };
