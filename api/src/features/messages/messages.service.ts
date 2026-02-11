import { Injectable } from "@nestjs/common";
import { MessageEntity } from "src/entities/message.entity";
import { DataSource } from "typeorm";

@Injectable()
export class MessagesService {
    constructor(private readonly datasource: DataSource) { }

    all(userId: number) {
        return this.datasource.manager.findAndCount(MessageEntity, { where: { user: { id: userId } } })
    }

    removeOne(userId: number, id: number) {
        return this.datasource.manager.transaction(async manager => {
            return manager.delete(MessageEntity, { id, user: { id: userId } });
        });
    }
}