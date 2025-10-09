import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UserEntity } from "../../entities/user.entity";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    getAll(
        @Query('q') query: string,
    ) {
        return this.userService.getAll(query);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Put(':id')
    editUser(
        @Param('id') id: string,
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.editUser(Number(id), user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    deleteUser(
        @Param('id') id: string
    ) {
        return this.userService.deleteUser(Number(id));
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    createUser(
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.createUser(user);
    }
}