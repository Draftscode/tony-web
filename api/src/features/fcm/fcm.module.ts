import { Module } from "@nestjs/common";
import { FcmService } from "./fcm.service";
import { NotificationsController } from "./fcm.controller";

@Module({
    providers: [FcmService],
    exports: [FcmService],
    controllers: [NotificationsController]
})
export class FcmModule { }