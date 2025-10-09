import { FindOptionsSelect } from "typeorm";
import { UserEntity } from "./../../entities/user.entity";


export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UserRepositoryOptions = {
    select: FindOptionsSelect<UserEntity>;
}

export interface IUserRepository {
    findOne(username: string, options?: Partial<UserRepositoryOptions>): Promise<UserEntity | null>;
    getUser(id: string | number): Promise<UserEntity | null>;
    createUser(data: Partial<UserEntity>): Promise<UserEntity>;
}
