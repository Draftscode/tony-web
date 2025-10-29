import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new UnauthorizedException({
                reason: err,
                info,
            });
        }
        // Check if the user is archived
        if (user.archived) {
            throw new UnauthorizedException({
                message: 'This account has been archived.',
            });
        }

        return user;
    }
}