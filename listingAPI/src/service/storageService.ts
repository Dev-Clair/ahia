import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import Config from "../../config";
import ForbiddenError from "../error/forbiddenError";
import HttpStatusCode from "../enum/httpStatusCode";

class StorageService {
  private s3: S3Client;

  private bucket: string;
  constructor(
    s3: S3Client = new S3Client({ region: Config.AWS.REGION }),
    bucket: string = Config.AWS.S3_BUCKET_NAME
  ) {
    this.s3 = s3;

    this.bucket = bucket;
  }

  private *attachmentGenerator(listing: string, action: string) {
    const allowedAction = ["GET", "DELETE"];

    if (!allowedAction.includes(action)) {
      throw new ForbiddenError(
        HttpStatusCode.FORBIDDEN,
        "Invalid Operation, cannot perform specified action."
      );
    }

    switch (action) {
      case "GET":
        this.download();
        break;

      case "DELETE":
        this.remove();
        break;

      default:
        break;
    }
  }

  public async upload(): Promise<void> {}

  public async download(): Promise<void> {}

  public async remove(): Promise<void> {}
}

export default StorageService;
