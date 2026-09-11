import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private sqsClient: SQSClient;
  private queueUrl: string;
  private isPolling = false;

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION || 'ap-southeast-2',
    });
    this.queueUrl = process.env.SQS_QUEUE_URL || '';
  }

  onModuleInit() {
    if (this.queueUrl) {
      this.isPolling = true;
      this.startWorker();
      this.logger.log('SQS Worker started polling...');
    } else {
      this.logger.warn('SQS_QUEUE_URL is not set. Worker not started.');
    }
  }

  onModuleDestroy() {
    this.isPolling = false;
  }

  // PRODUCER: Send message to SQS
  async pushJob(payload: { fileKey: string; action: string }) {
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL is not configured');
    }

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString(),
      }),
    });

    const result = await this.sqsClient.send(command);
    this.logger.log(`Job sent to SQS: MessageId=${result.MessageId}`);
    return {
      message: 'Job pushed to queue successfully',
      messageId: result.MessageId,
    };
  }

  // CONSUMER WORKER: Long polling loop to receive & process messages
  private async startWorker() {
    while (this.isPolling) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20, // Long Polling wait up to 20s
        });

        const response = await this.sqsClient.send(command);

        if (response.Messages && response.Messages.length > 0) {
          for (const message of response.Messages) {
            await this.processMessage(message);
          }
        }
      } catch (error) {
        this.logger.error('Error polling SQS messages:', error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async processMessage(message: any) {
    this.logger.log(`[WORKER] Processing message ID: ${message.MessageId}`);
    const body = JSON.parse(message.Body);
    this.logger.log(`[WORKER] Job payload: ${JSON.stringify(body)}`);

    // Simulate heavy background processing (3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Delete message after processing success
    const deleteCommand = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    });
    await this.sqsClient.send(deleteCommand);
    this.logger.log(`[WORKER] Job completed & deleted from SQS: ${message.MessageId}`);
  }
}
