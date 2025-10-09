import { HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    handleRequest(err: any, user: any, info: any, context: any, status: any) {
        if (err || !user) {
            throw new HttpException(err.message, err.status, err.response?.error);
        }
        return user;
    }
}