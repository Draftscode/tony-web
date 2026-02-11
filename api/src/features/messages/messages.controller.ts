import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { User } from "../auth/data-access/authorized-request";
import { UserEntity } from "src/entities/user.entity";

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }
    @UseGuards(JwtAuthGuard)
    @Get()
    all(@User() user: UserEntity) {
        return this.messagesService.all(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    removeMessage(
        @Param('id', ParseIntPipe) id: number,
        @User() user: UserEntity,
    ) {
        return this.messagesService.removeOne(user.id, id);
    }
}