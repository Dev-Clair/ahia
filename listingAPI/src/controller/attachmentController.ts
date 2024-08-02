import Attachment from "../model/attachmentModel";
import storageService from "../service/storageService";

/**
 * Create a new attachment in collection.
 */
const createAttachmentCollection = async (
  id: string,
  type: string,
  category: string,
  body: any
): Promise<string> => {
  try {
    const key = await storageService.upload(id, type, category, body);

    const attachment = await Attachment.create({
      type: type,
      category: category,
      key: key,
    });

    return attachment.key;
  } catch (err: any) {
    throw err;
  }
};

/**
 * Retrieve collection of attachments.
 */
const retrieveAttachmentCollection = async (
  prefix: string
): Promise<Response | void> => {
  storageService.retrieveCollection(prefix);
};

/**
 * Retrieve an attachment item using its :id.
 */
const retrieveAttachmentItem = async (
  key: string
): Promise<Response | void> => {
  storageService.download(key);
};

/**
 * Remove an attachment item using its :id.
 */
const deleteAttachmentItem = async (key: string): Promise<Response | void> => {
  storageService.remove(key);
};

export default {
  createAttachmentCollection,
  retrieveAttachmentCollection,
  retrieveAttachmentItem,
  deleteAttachmentItem,
};
