import { Injectable } from "@nestjs/common";
import { ClientEntity } from "src/entities/client.entity";
import { DataSource } from "typeorm";

@Injectable()
export class ClientsService {
    constructor(private readonly datasource: DataSource) { }

    getClient(clientId: number) {
        return this.datasource.manager.findOne(ClientEntity, { where: { id: clientId } });
    }

    getClients() {
        return this.datasource.manager.find(ClientEntity, { where: {} });
    }
}