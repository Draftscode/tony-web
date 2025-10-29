import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from '@nestjs/jwt';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { UserEntity } from "src/entities/user.entity";
import { DataSource } from "typeorm";
import type { IUserRepository } from "../../common/contracts/user-repository.interface";
import { USER_REPOSITORY } from "../../common/contracts/user-repository.interface";


export function encodePassword(password: string): string {
    const salt: string = genSaltSync(10);
    return hashSync(password, salt);
}

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(USER_REPOSITORY) private readonly usersService: IUserRepository,
        private readonly jwtService: JwtService,
        private readonly datasource: DataSource
    ) {
        
    }

    async getMe() {

    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username, {
            select: {
                id: true,
                password: true,
            }
        });
        if (!user) { return null; }

        const { password, ...result } = user;

        if (compareSync(pass, password)) {
            return result;
        }

        return null;
    }

    async refreshToken(refreshToken: string) {
        // Validate old refresh token
        const payload = this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
        });


        // Optionally check DB if token exists and is not revoked
        const user = await this.usersService.getUser(payload.sub);
        if (!user) throw new UnauthorizedException();


        const accessToken = this.jwtService.sign(
            { username: user.username, sub: user.id },
            { expiresIn: '15m' });


        const newRefreshToken = this.jwtService.sign(
            { username: user.username, sub: user.id }, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '2d'
        })

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
        };
    }

    async validateToken(jwt: string) {
        try {
            const v = this.jwtService.verify(jwt);
            const u = await this.usersService.getUser(v.sub);
            if (!u) return false;

            const { password, ...rest } = u;
            return rest;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async login(user: UserEntity) {
        const payload = { username: user.username, sub: user.id };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '15m',
            }),

            refresh_token: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '2d'
            })
        };
    }

    public async register(username: string, password: string, silent = false): Promise<boolean> {
        const user = await this.datasource.manager.findOne(UserEntity, { where: { username } });

        if (user) {
            if (!silent) {
                throw new HttpException('Conflict', HttpStatus.CONFLICT);
            }
            return false;
        }

        return !!(await this.usersService.createUser({ username, password }));
    }
}
