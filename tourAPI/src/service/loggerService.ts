import { createLogger, format, transports } from "winston";
import {
  CloudWatchLogsClient,
  CloudWatchLogsClientConfig,
  DescribeLogStreamsCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import Config from "../../config";

interface CloudWatchLogsConfigOptions {
  logGroupName: string;
  logStreamName: string;
}

class CloudWatchLogsTransport extends transports.Stream {
  private cloudWatchLogsClient: CloudWatchLogsClient;

  private logGroupName: string;

  private logStreamName: string;

  private sequenceToken: string | undefined;

  constructor(
    clientConfig: CloudWatchLogsClientConfig,
    logConfig: CloudWatchLogsConfigOptions,
    options?: transports.StreamTransportOptions
  ) {
    super(options);
    this.logGroupName = logConfig.logGroupName;

    this.logStreamName = logConfig.logStreamName;

    this.cloudWatchLogsClient = new CloudWatchLogsClient(clientConfig);

    this.initializeSequenceToken();
  }

  private async initializeSequenceToken() {
    try {
      const describeLogStreamsCommand = new DescribeLogStreamsCommand({
        logGroupName: this.logGroupName,
        logStreamNamePrefix: this.logStreamName,
      });

      const response = await this.cloudWatchLogsClient.send(
        describeLogStreamsCommand
      );

      const logStream = response.logStreams?.find(
        (stream) => stream.logStreamName === this.logStreamName
      );

      this.sequenceToken = logStream?.uploadSequenceToken;
    } catch (error) {
      console.error("Failed to retrieve sequence token:", error);
    }
  }

  /**
   *
   * @param info
   * @param callback
   */
  async log(info: any, callback: () => void): Promise<void> {
    setImmediate(() => this.emit("logged", info));

    const logMessage = {
      timestamp: new Date().getTime(),
      message: `${info.timestamp} ${info.level}: ${info.message}`,
    };

    try {
      const input = {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [logMessage],
        sequenceToken: this.sequenceToken,
      };

      const command = new PutLogEventsCommand(input);

      const response = await this.cloudWatchLogsClient.send(command);

      this.sequenceToken = response.nextSequenceToken;
    } catch (error) {
      console.error("Error sending logs to CloudWatch:", error);
    }

    callback();
  }

  /**
   * Creates and returns a new instance of the CloudWatchLogsTransport class.
   * @returns CloudWatchLogsTransport
   */
  public static Make(): CloudWatchLogsTransport {
    const clientConfiguration: CloudWatchLogsClientConfig = {
      region: Config.AWS.REGION,
      credentials: {
        accessKeyId: Config.AWS.IAM.ACCESS_KEY_ID,
        secretAccessKey: Config.AWS.IAM.SECRET_ACCESS_KEY,
      },
    };

    const logConfiguration: CloudWatchLogsConfigOptions = {
      logGroupName: Config.AWS.CLOUDWATCH.LOGS.GROUP_NAME,
      logStreamName: Config.AWS.CLOUDWATCH.LOGS.STREAM_NAME,
    };

    return new CloudWatchLogsTransport(clientConfiguration, logConfiguration);
  }
}

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const Logger = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
    CloudWatchLogsTransport.Make(),
  ],
});

export default Logger;
