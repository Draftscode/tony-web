import { Module } from "@nestjs/common";
import { RoleRepositoryModule } from "src/common/contracts/role-repository.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
    imports: [RoleRepositoryModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UserModule { }