import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";

@Module({
    providers: [MessagesService],
    exports: [MessagesService],
    controllers: [MessagesController],
})
export class MessagesModule { }