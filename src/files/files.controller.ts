import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto.js';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presigned-url')
  generatePresignedUploadUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.filesService.generatePresignedUploadUrl(dto);
  }

  @Get('download-url')
  generatePresignedDownloadUrl(@Query('key') key: string) {
    return this.filesService.generatePresignedDownloadUrl(key);
  }
}
