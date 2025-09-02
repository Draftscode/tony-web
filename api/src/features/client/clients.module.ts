import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";

@Module({
    imports: [AuthModule],
    providers: [ClientsService],
    controllers: [ClientsController],
})
export class ClientsModule {

}