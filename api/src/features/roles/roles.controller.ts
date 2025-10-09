import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RoleService } from "./roles.service";

@Controller('roles')
export class RolesController {
    constructor(private readonly roleService: RoleService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAllRoles() {
        return this.roleService.getAllRoles();
    }
}