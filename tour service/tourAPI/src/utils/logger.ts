import { createLogger, format, LogEntry, transports } from "winston";
import TransportStream, { TransportStreamOptions } from "winston-transport";
import {
  CloudWatchLogsClient,
  CloudWatchLogsClientConfig,
  DescribeLogStreamsCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import Config from "../../config";

/** ***************************************Create Transport**************/

interface CloudWatchLogsConfigOptions {
  logGroupName: string;
  logStreamName: string;
}

/**
 * Cloudwatch Logs Transport
 * @method initializeSequenceToken
 * @method log
 * @method Create
 */
class CloudWatchLogsTransport extends TransportStream {
  private cloudWatchLogsClient: CloudWatchLogsClient;

  private logGroupName: string;

  private logStreamName: string;

  private sequenceToken: string | undefined;

  constructor(
    clientConfig: CloudWatchLogsClientConfig,
    logConfig: CloudWatchLogsConfigOptions,
    options?: TransportStreamOptions
  ) {
    super(options);
    this.logGroupName = logConfig.logGroupName;

    this.logStreamName = logConfig.logStreamName;

    this.cloudWatchLogsClient = new CloudWatchLogsClient(clientConfig);

    this.initializeSequenceToken();
  }

  /**
   * Retrieves and initializes the sequence to ensure log orderings
   * @private
   */
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
   * Sends logs to cloudwatch
   * @param info
   * @param callback
   */
  async log(info: LogEntry, callback: () => void): Promise<void> {
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
   * Creates and returns a new instance of the CloudWatchLogsTransport class
   */
  public static Create(): CloudWatchLogsTransport {
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

/** ***************************************Create Logger**************/

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const Logger = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(),
    // CloudWatchLogsTransport.Make()
  ],
  defaultMeta: Config.TOUR_SERVICE.NAME,
});

export default Logger;
