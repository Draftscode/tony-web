import { Controller, Get } from "@nestjs/common";
import { BrokerService } from "./broker.service";

@Controller('broker')
export class BrokerController {
    constructor(private readonly brokerService: BrokerService) { }

    @Get('')
    getAllBrokers() {
        return this.brokerService.getAllBrokers();
    }
}