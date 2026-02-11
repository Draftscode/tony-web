import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { Roles, SystemRole } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UserEntity } from "../../entities/user.entity";
import { UsersService } from "./users.service";
import { User } from "../auth/data-access/authorized-request";

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.admin, SystemRole.users)
    @Get()
    getAll(
        @Query('q') query: string,
    ) {
        return this.userService.getAll(query);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put('me')
    editMe(
        @User() me: UserEntity,
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.editUser(me.id, user);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.admin, SystemRole.users)
    @Put(':id')
    editUser(
        @Param('id') id: string,
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.editUser(Number(id), user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.admin, SystemRole.users)
    @Delete(':id')
    deleteUser(
        @Param('id') id: string
    ) {
        return this.userService.deleteUser(Number(id));
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(SystemRole.admin, SystemRole.users)
    @Post()
    createUser(
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.createUser(user);
    }
}