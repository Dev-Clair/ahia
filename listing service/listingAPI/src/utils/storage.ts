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

class Storage {
  private s3: S3Client;

  private bucket: string;

  constructor(configuration: S3ClientConfig, bucketName: string) {
    this.s3 = new S3Client(configuration);

    this.bucket = bucketName;
  }

  /**
   * Uploads an object to the S3
   * @param id unique identifier for the object
   * @param body file buffer or stream
   * @param contentType  optional content type for the file object
   */
  public async Upload(
    id: string,
    body: Buffer,
    contentType?: string
  ): Promise<string | void> {
    try {
      const key = `${id}/${randomUUID()}`;

      const input = {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType ?? "application/octet-stream",
        ContentEncoding: "UTF-8",
      };

      const command = new PutObjectCommand(input);

      const response = await this.s3.send(command);

      if ("VersionId" in response) return key;
    } catch (err: any) {
      throw new Error(
        `Failed to upload file object to S3: ${JSON.stringify({
          name: err.name,
          code: err.code,
          message: err.message,
        })}`
      );
    }
  }

  /**
   * Downloads an object from S3
   * @param key key of the object in S3
   * @param start start byte for range retrieval (optional)
   * @param end end byte for range retrieval (optional)
   */
  public async Download(key: string, start?: string, end?: string) {
    try {
      const streamRange = start && end ? `bytes=${start}-${end}` : undefined;

      const input = {
        Bucket: this.bucket,
        Key: key,
        Range: streamRange,
      };
      const command = new GetObjectCommand(input);

      const response = await this.s3.send(command);

      return response.Body;
    } catch (err: any) {
      throw new Error(
        `Failed to download file object from S3: ${JSON.stringify({
          name: err.name,
          code: err.code,
          message: err.message,
        })}`
      );
    }
  }

  /**
   * Deletes an object from S3
   * @param key key of the object to delete
   */
  public async Delete(key: string): Promise<boolean | undefined> {
    try {
      const input = {
        Bucket: this.bucket,
        Key: key,
      };

      const command = new DeleteObjectCommand(input);

      const response = await this.s3.send(command);

      return response.DeleteMarker ?? false;
    } catch (err: any) {
      throw new Error(
        `Failed to delete file object from S3: ${JSON.stringify({
          name: err.name,
          code: err.code,
          message: err.message,
        })}`
      );
    }
  }

  /**
   * Retrieves a paginated collection of objects from S3
   * @param prefix prefix to filter objects (optional)
   */
  public async *RetrieveCollection(
    prefix: string
  ): AsyncGenerator<string | undefined, any, unknown> {
    let continuationToken: string | undefined = undefined;

    do {
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
    } while (continuationToken);
  }

  /**
   * Creates and returns a new instance of the Storage class
   */
  public static Create(): Storage {
    const configuration: S3ClientConfig = {
      region: Config.AWS.REGION,
      credentials: {
        accessKeyId: Config.AWS.IAM.ACCESS_KEY_ID,
        secretAccessKey: Config.AWS.IAM.SECRET_ACCESS_KEY,
      },
    };

    return new Storage(configuration, Config.AWS.S3_BUCKET_NAME);
  }
}

export default Storage;
