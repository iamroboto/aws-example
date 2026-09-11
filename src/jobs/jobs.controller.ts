import { Controller, Post, Body } from '@nestjs/common';
import { JobsService } from './jobs.service.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async createJob(@Body() body: { fileKey: string; action: string }) {
    return this.jobsService.pushJob(body);
  }
}
