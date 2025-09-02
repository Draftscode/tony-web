import { Controller, Get, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {

    }

    @UseGuards(JwtAuthGuard)
    @Get('')
    getClients() {
        return this.clientsService.getClients();
    }

    @Get(':id')
    getClient(id: number) {
        return this.clientsService.getClient(id);
    }
}