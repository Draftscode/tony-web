import { Module } from "@nestjs/common";
import { Model } from "firebase-admin/machine-learning";
import { BrokerService } from "./broker.service";
import { BrokerController } from "./broker.controller";

@Module({
    providers: [BrokerService],
    exports: [BrokerService],
    controllers: [BrokerController]
})
export class BrokerModule { }