import { Controller, Post, Body } from '@nestjs/common';
import { EventsService } from './events.service.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('publish')
  async publishEvent(@Body() body: { eventType: string; payload: any }) {
    const eventType = body.eventType || 'USER_REGISTERED';
    const payload = body.payload || { userId: 123, email: 'user@example.com' };
    return this.eventsService.publishEvent(eventType, payload);
  }
}
