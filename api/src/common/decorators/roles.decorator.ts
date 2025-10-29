import { SetMetadata } from '@nestjs/common';

export enum SystemRole {
    admin = 'admin',
    customers = 'customers',
    insurers = 'insurers',
    divisions = 'divisions',
    users = 'users',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);