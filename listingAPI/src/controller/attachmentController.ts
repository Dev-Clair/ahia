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

  public async createAttachment(): Promise<void> {
    this.storageService.upload();
  }

  public async retrieveAttachments(): Promise<void> {
    this.storageService.download();
  }

  public async retrieveAttachment(): Promise<void> {
    this.storageService.download();
  }

  public async deleteAttachment(): Promise<void> {
    this.storageService.remove();
  }
}

export default AttachmentController;
