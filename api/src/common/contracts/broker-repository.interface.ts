import { BrokerEntity } from "src/entities/broker.entity";


export const BROKER_REPOSITORY = Symbol('BROKER_REPOSITORY');

export interface IBrokerRepository {
    findByIds(brokerIds: string[]): Promise<BrokerEntity[]>;
}
