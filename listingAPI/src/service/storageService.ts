import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import Config from "../../config";

class StorageService {
  private s3: S3Client;

  private bucket: string;
  constructor(
    s3: S3Client = new S3Client([
      {
        region: Config.AWS.REGION,
        credentials: {
          accessKeyId: Config.AWS.ACCESS_KEY_ID,
          secretAccessKey: Config.AWS.SECRET_ACCESS_KEY,
        },
      },
    ]),
    bucket: string = Config.AWS.S3_BUCKET_NAME
  ) {
    this.s3 = s3;

    this.bucket = bucket;
  }

  public async upload(
    key: string,
    type: string,
    body: any
  ): Promise<boolean | void> {
    try {
      const input = {
        Bucket: this.bucket,
        Key: `${type}/${key}/${nanoid()}`,
        Body: body,
        ContentEncoding: "UTF-8",
        ContentMD5: "",
      };

      const command = new PutObjectCommand(input);

      const response = await this.s3.send(command);

      if ("VersionId" in Object.keys(response)) {
        return true;
      } else {
        return false;
      }
    } catch (err: any) {
      throw err;
    }
  }

  public async download(key: string, start: string = "0", end: string = "9") {
    try {
      const streamRange = `bytes=${start}-${end}`;

      const input = {
        Bucket: this.bucket,
        Key: key,
        Range: streamRange,
      };
      const command = new GetObjectCommand(input);

      const response = await this.s3.send(command);

      return response.Body;
    } catch (err: any) {
      throw err;
    }
  }

  public async remove(key: string): Promise<boolean | undefined> {
    try {
      const input = {
        Bucket: this.bucket,
        Key: key,
      };

      const command = new DeleteObjectCommand(input);

      const response = await this.s3.send(command);

      return response.DeleteMarker;
    } catch (err: any) {
      throw err;
    }
  }

  public async getObjectFileSize(key: string): Promise<number | undefined> {
    try {
      const input = {
        Bucket: this.bucket,
        Key: key,
      };

      const command = new HeadObjectCommand(input);

      const response = await this.s3.send(command);

      return response.ContentLength;
    } catch (err: any) {
      throw err;
    }
  }

  public async *retrieveCollection(
    prefix: string
  ): AsyncGenerator<string | undefined, any, unknown> {
    const input = {
      Bucket: this.bucket,
      Prefix: prefix,
    };

    const command = new ListObjectsV2Command(input);

    const response = await this.s3.send(command);

    const keys = response.Contents?.map((item) => item.Key) ?? [];

    for (const key of keys) {
      yield key;
    }
  }
}

export default StorageService;
