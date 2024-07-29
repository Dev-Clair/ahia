import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import Config from "../../config";

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

  public async upload(): Promise<void> {}

  public async download(): Promise<void> {}

  public async remove(): Promise<void> {}
}

export default StorageService;
