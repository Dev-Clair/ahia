import NotFoundError from "../error/notfoundError";
import IListing from "../interface/IListing";
import DocumentValueResolver from "../utils/documentResolver";
import IdempotencyManager from "../utils/idempotencyManager";

const getDocument = async (paramValue: string): Promise<IListing | null> => {
  return await DocumentValueResolver.Create()
    .Resolve(paramValue)
    .catch((err: Error | NotFoundError) => {
      throw err;
    });
};

const verifyIdempotencyKey = async (key: string): Promise<boolean> => {
  return await IdempotencyManager.Verify(key);
};

export default { getDocument, verifyIdempotencyKey };
