import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { JWEDecryptionFailed } from "jose/errors";

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll(
        @Query('q') query: string,
    ) {
        return this.userService.getAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    editUser(
        @Param('id') id: string,
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.editUser(Number(id), user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deleteUser(
        @Param('id') id: string
    ) {
        return this.userService.deleteUser(Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createUser(
        @Body() user: Partial<UserEntity>,
    ) {
        return this.userService.createUser(user);
    }
}