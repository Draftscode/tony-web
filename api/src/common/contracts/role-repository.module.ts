import { Module } from "@nestjs/common";
import { RoleService } from "src/features/roles/roles.service";
import { ROLE_REPOSITORY } from "./roles-repository.interface";

@Module({
    providers: [{ provide: ROLE_REPOSITORY, useClass: RoleService }],
    exports: [ROLE_REPOSITORY],
})
export class RoleRepositoryModule { }