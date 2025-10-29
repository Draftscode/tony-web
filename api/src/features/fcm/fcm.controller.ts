import { Body, Controller, Post } from '@nestjs/common';
import { FcmService } from './fcm.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly fcmService: FcmService) { }

    @Post('subscribe')
    subscribe(@Body() body: { token: string, topic: string }) {
        return this.fcmService.subscribeTokenToTopic(body.token, body.topic);
    }

    @Post('send')
    send(@Body() body: { token: string, title: string, message: string }) {
        return this.fcmService.sendNotification(body.token, body.title, body.message);
    }

}