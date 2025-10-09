import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from "../../entities/user.entity";

export const User = createParamDecorator(
    <K extends keyof UserEntity>(key: keyof UserEntity | undefined, ctx: ExecutionContext): UserEntity | UserEntity[K] => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user as UserEntity;

        return key ? user[key] as UserEntity[K] : user;
    },
);