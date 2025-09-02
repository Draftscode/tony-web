import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { AuthService } from "./auth.service";
import { User } from "./data-access/authorized-request";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";

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
    async login(@Req() req) {
        return this.authService.login(req.user);
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