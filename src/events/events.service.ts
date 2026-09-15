import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private snsClient: SNSClient;
  private topicArn: string;

  constructor() {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION || 'ap-southeast-2',
    });
    this.topicArn = process.env.SNS_TOPIC_ARN || '';
  }

  // Publish Event to SNS Topic (Pub/Sub)
  async publishEvent(eventType: string, payload: any) {
    if (!this.topicArn) {
      throw new Error('SNS_TOPIC_ARN is not configured');
    }

    const eventData = {
      eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Subject: eventType,
      Message: JSON.stringify(eventData),
    });

    const result = await this.snsClient.send(command);
    this.logger.log(
      `Event '${eventType}' published to SNS Topic successfully: MessageId=${result.MessageId}`,
    );

    return {
      message: `Event '${eventType}' published to SNS Topic successfully`,
      messageId: result.MessageId,
      eventData,
    };
  }
}
