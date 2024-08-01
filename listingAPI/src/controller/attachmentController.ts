import AsyncCatch from "../utils/asynCatch";
import Attachment from "../model/attachmentModel";
import { NextFunction, Request, Response } from "express";
import Features from "../utils/feature";
import HttpStatusCode from "../enum/httpStatusCode";
import Idempotency from "../model/idempotencyModel";
import Mail from "../utils/mail";
import Notify from "../utils/notify";
import NotFoundError from "../error/notfoundError";
import Retry from "../utils/retry";
import StorageService from "../service/storageService";

class AttachmentController {
  private storageService: StorageService;
  constructor(StorageService: StorageService) {
    this.storageService = StorageService;
  }

  public async createAttachment(
    id: string,
    type: string,
    body: any
  ): Promise<void> {
    this.storageService.upload(id, type, body);
  }

  public async retrieveAttachments(prefix: string): Promise<void> {
    this.storageService.retrieveCollection(prefix);
  }

  public async retrieveAttachment(key: string): Promise<void> {
    this.storageService.download(key);
  }

  public async deleteAttachment(key: string): Promise<void> {
    this.storageService.remove(key);
  }
}

export default AttachmentController;
