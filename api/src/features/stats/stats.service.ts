import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CustomerEntity } from '../../entities/customer.entity';
import { FileEntity } from '../../entities/file.entity';
import { CompanyEntity } from '../../entities/company.entity';
import { ContractEntity } from '../../entities/contract.entity';
import { UserEntity } from '../../entities/user.entity';
import { MessageEntity } from '../../entities/message.entity';

@Injectable()
export class StatsService {
  constructor(@InjectDataSource() private readonly datasource: DataSource) {}

  async getStats(userId: number) {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nowIso = now.toISOString();
    const in30DaysIso = in30Days.toISOString();

    const [
      customersCount,
      filesCount,
      companiesCount,
      contractsCount,
      usersCount,
      unreadMessagesCount,
      contractsExpiringSoonCount,
      recentFiles,
    ] = await Promise.all([
      this.datasource.manager.count(CustomerEntity),
      this.datasource.manager.count(FileEntity),
      this.datasource.manager.count(CompanyEntity),
      this.datasource.manager.count(ContractEntity),
      this.datasource.manager.count(UserEntity, { where: { archived: false } }),
      this.datasource.manager.count(MessageEntity, {
        where: { read: false, user: { id: userId } },
      }),
      this.datasource.manager
        .createQueryBuilder(ContractEntity, 'contract')
        .where('contract.end >= :now AND contract.end <= :in30Days', {
          now: nowIso,
          in30Days: in30DaysIso,
        })
        .getCount(),
      this.datasource.manager.find(FileEntity, {
        order: { lastModified: 'DESC' },
        take: 5,
        select: ['id', 'filename', 'lastModified'],
      }),
    ]);

    return {
      customersCount,
      filesCount,
      companiesCount,
      contractsCount,
      usersCount,
      unreadMessagesCount,
      contractsExpiringSoonCount,
      recentFiles,
    };
  }
}
