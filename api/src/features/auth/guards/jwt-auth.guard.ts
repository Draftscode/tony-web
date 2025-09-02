import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    @Inject(AuthService) private readonly authService: AuthService


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request & { user, accessToken }>()

        const tokenHeader = req.headers ? req.headers['authorization'] : null;
        const token = tokenHeader ? tokenHeader.replace('Bearer', '').replace(/ /g, '') : null;

        if (!token) {
            throw new UnauthorizedException({ reason: 'no token found' });
        }

        let user;
        try {
            user = await this.authService.validateToken(token);
            req.user = user;
            req.accessToken = token;
        } catch (e) {
            throw new UnauthorizedException({ reason: 'invalid access token' });
        }

        if (!user) {
            throw new UnauthorizedException({ reason: 'You are not logged in anymore' });
        }


        return true;
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new UnauthorizedException({
                reason: err,
                info,
            });
        }

        return user;
    }
}