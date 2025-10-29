import { Module } from "@nestjs/common";
import { BrokerService } from "src/features/broker/broker.service";
import { BROKER_REPOSITORY } from "./broker-repository.interface";

@Module({
    providers: [{ provide: BROKER_REPOSITORY, useClass: BrokerService }],
    exports: [BROKER_REPOSITORY],
})
export class BrokerRepositoryModule { }