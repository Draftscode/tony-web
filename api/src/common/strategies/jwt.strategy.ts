import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { IUserRepository } from "../contracts/user-repository.interface";
import { USER_REPOSITORY } from "../contracts/user-repository.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        readonly configService: ConfigService,
        @Inject(USER_REPOSITORY)
        private readonly userService: IUserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') as string,
        });
    }

    async validate(payload: any) {
        return this.userService.getUser(payload.sub);
    }

}