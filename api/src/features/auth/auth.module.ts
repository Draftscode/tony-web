import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService, UsersService } from "./auth.service";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { LocalStrategy } from "./strategy/local.strategy";

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.register({
            secret: 'supersecretkey',
            signOptions: { expiresIn: '60s' },
        }),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        UsersService,
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }