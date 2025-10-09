import { RoleEntity } from "src/entities/roles.entity";


export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
    findByIds(roleIds: number[]): Promise<RoleEntity[]>;
}
