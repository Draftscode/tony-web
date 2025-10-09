import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserRepositoryModule } from "src/common/contracts/user-repository.module";
import { JwtStrategy } from "./../../common/strategies/jwt.strategy";
import { LocalStrategy } from "./../../common/strategies/local.strategy";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        UserRepositoryModule,
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
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }