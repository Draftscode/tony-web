import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // no roles required -> allow
        }

        const user: UserEntity = context.switchToHttp().getRequest().user;

        if (!user) {
            return false; // not logged in
        }

        return requiredRoles.some((role) => user.roles?.find(r => r.name === role));
    }
}
