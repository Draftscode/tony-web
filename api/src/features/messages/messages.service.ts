import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessageEntity } from 'src/entities/message.entity';
import { DataSource, LessThan } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(private readonly datasource: DataSource) {}

  all(userId: number) {
    return this.datasource.manager.findAndCount(MessageEntity, {
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }

  removeOne(userId: number, id: number) {
    return this.datasource.manager.transaction(async (manager) => {
      return manager.delete(MessageEntity, { id, user: { id: userId } });
    });
  }

  count(userId: number) {
    return this.datasource.manager.count(MessageEntity, {
      where: { user: { id: userId } },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  deleteExpired() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return this.datasource.manager.delete(MessageEntity, {
      createdAt: LessThan(cutoff.toISOString()),
    });
  }
}
