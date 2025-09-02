import { HttpException, HttpStatus, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from '@nestjs/jwt';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { UserEntity } from "src/entities/user.entity";
import { DataSource } from "typeorm";

@Injectable()
export class UsersService {
    constructor(private readonly datasource: DataSource) { }

    async getUser(id: number) {
        return this.datasource.manager.findOneOrFail(UserEntity, { where: { id } });
    }

    async findOne(username: string): Promise<UserEntity | null> {
        return this.datasource.manager.findOne(UserEntity, { where: { username } });
    }
}
function encodePassword(password: string): string {
    const salt: string = genSaltSync(10);
    return hashSync(password, salt);
}

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly datasource: DataSource
    ) {
        try {
            this.register('admin2', 'admin2', true);
        } catch { }
    }

    async getMe() {

    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);

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
            expiresIn: '7d'
        })

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
        };
    }

    async validateToken(jwt: string) {
        try {
            const v = this.jwtService.verify(jwt);
            const { password, ...rest } = await this.usersService.getUser(v.sub);
            return rest;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '15m',
            }),

            refresh_token: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d'
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

        await this.datasource.transaction(async manager => {
            const newUser = manager.create(UserEntity, { username });
            newUser.password = encodePassword(password);
            manager.save(newUser);
        });

        return true;
    }
}
