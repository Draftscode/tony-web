import { Module } from "@nestjs/common";
import { RoleRepositoryModule } from "src/common/contracts/role-repository.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { BrokerRepositoryModule } from "src/common/contracts/broker-repository.module";

@Module({
    imports: [RoleRepositoryModule, BrokerRepositoryModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UserModule { }