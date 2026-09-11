import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>(
      'AWS_REGION',
      'ap-southeast-2',
    );
    this.bucketName = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'aws-example-files-bucket-sondev2026',
    );

    this.s3Client = new S3Client({
      region,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async generatePresignedUploadUrl(dto: GeneratePresignedUrlDto) {
    try {
      const fileExtension = dto.filename.includes('.')
        ? dto.filename.split('.').pop()
        : '';
      const objectKey = `uploads/${Date.now()}-${randomUUID()}${
        fileExtension ? '.' + fileExtension : ''
      }`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        ContentType: dto.contentType,
      });

      // Expiration time: 15 minutes (900 seconds)
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });

      return {
        uploadUrl,
        objectKey,
        expiresInSeconds: 900,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(
        `Failed to generate presigned upload URL: ${msg}`,
      );
    }
  }

  async generatePresignedDownloadUrl(objectKey: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      // Expiration time: 1 hour (3600 seconds)
      const downloadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      return {
        downloadUrl,
        objectKey,
        expiresInSeconds: 3600,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(
        `Failed to generate presigned download URL: ${msg}`,
      );
    }
  }
}
