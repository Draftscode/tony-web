import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { LocalAuthGuard } from "../../common/guards/local-auth.guard";
import { AuthService } from "./auth.service";
import { User } from "./data-access/authorized-request";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@User() user: UserEntity) {
        return user;
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@User() user: UserEntity) {
        return this.authService.login(user);
    }

    @UseGuards(LocalAuthGuard)
    @Post('logout')
    async logout(@Req() req) {
        return req.logout();
    }

    @Post('register')
    register(
        @Body('username') username: string,
        @Body('password') password: string,
    ) {
        return this.authService.register(username, password);
    }

}