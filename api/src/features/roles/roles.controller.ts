import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleService } from "./roles.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles, SystemRole } from "src/common/decorators/roles.decorator";

@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RoleService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.admin, SystemRole.users)
    @Get()
    getAllRoles() {
        return this.roleService.getAllRoles();
    }
}