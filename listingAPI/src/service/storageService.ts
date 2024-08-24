import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import Config from "../../config";

class StorageService {
  private s3: S3Client;

  private bucket: string;
  constructor(configuration: S3ClientConfig, bucketName: string) {
    this.s3 = new S3Client(configuration);

    this.bucket = bucketName;
  }

  /**
   * Uploads an object to the s3 storage bucket
   * @param id
   * @param body
   * @returns Promise<string | void>
   */
  public async upload(id: string, body: any): Promise<string | void> {
    try {
      const key = `${id}/${randomUUID()}`;

      const input = {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentEncoding: "UTF-8",
      };

      const command = new PutObjectCommand(input);

      const response = await this.s3.send(command);

      if (Object.keys(response).includes("VersionId")) {
        return key;
      }
    } catch (err: any) {
      throw err;
    }
  }

  /**
   *
   * @param key
   * @param start
   * @param end
   * @returns
   */
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

  /**
   * Retrieves a collection of object names from the storage bucket
   * @param prefix
   * @returns Asyncgenerator
   */
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

  /**
   * Creates and returns a new instance of the Storage class.
   * @returns StorageService
   */
  public static Make(): StorageService {
    const configuration: S3ClientConfig = {
      region: Config.AWS.REGION,
      credentials: {
        accessKeyId: Config.AWS.IAM.ACCESS_KEY_ID,
        secretAccessKey: Config.AWS.IAM.SECRET_ACCESS_KEY,
      },
    };

    return new StorageService(configuration, Config.AWS.S3_BUCKET.NAME);
  }
}

export default StorageService;
