import { Module } from "@nestjs/common";
import { UsersService } from "src/features/users/users.service";
import { USER_REPOSITORY } from "./user-repository.interface";
import { RoleRepositoryModule } from "./role-repository.module";

@Module({
    imports: [RoleRepositoryModule],
    providers: [{ provide: USER_REPOSITORY, useClass: UsersService }],
    exports: [USER_REPOSITORY]
})
export class UserRepositoryModule { }