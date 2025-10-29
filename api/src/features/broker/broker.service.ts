import { Injectable } from "@nestjs/common";
import { IBrokerRepository } from "src/common/contracts/broker-repository.interface";
import { BrokerEntity } from "src/entities/broker.entity";
import { DataSource, In } from "typeorm";

@Injectable()
export class BrokerService implements IBrokerRepository {
    constructor(private readonly datasource: DataSource) { }

    async getAllBrokers() {
        const [items, total] = await this.datasource.manager.findAndCount(BrokerEntity, {});

        return { items, total };
    }

    findByIds(brokerIds: string[]): Promise<BrokerEntity[]> {
        return this.datasource.manager.find(BrokerEntity, { where: { id: In(brokerIds) } });
    }
}