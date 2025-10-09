import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { DataSource, ILike } from "typeorm";
import { ROLE_REPOSITORY } from "../../common/contracts/roles-repository.interface";
import type { IUserRepository, UserRepositoryOptions } from "../../common/contracts/user-repository.interface";
import { encodePassword } from "../auth/auth.service";
import { RoleService } from "../roles/roles.service";

@Injectable()
export class UsersService implements IUserRepository {
    constructor(
        private readonly datasource: DataSource,
        @Inject(ROLE_REPOSITORY) private readonly roleRepo: RoleService,
    ) { }

    async getUser(id: number) {
        return this.datasource.manager.findOneOrFail(UserEntity, { where: { id } });
    }

    async createUser(user: Partial<UserEntity>) {
        const password = user.password;
        if (!password) {
            throw BadRequestException;
        }

        return await this.datasource.transaction(async manager => {
            const newUser = manager.create(UserEntity, user);
            newUser.password = encodePassword(password);
            return manager.save(newUser);
        });
    }

    async findOne(username: string, options?: Partial<UserRepositoryOptions>): Promise<UserEntity | null> {
        return this.datasource.manager.findOne(UserEntity, { where: { username }, select: options?.select });
    }

    async getAll(query: string = '') {
        const [items, total] = await this.datasource.manager.findAndCount(UserEntity, { where: { username: ILike(`%${query}%`) } });
        return { items, total };
    }

    async deleteUser(id: number) {
        if (id === 1) {
            throw BadRequestException;
        }
        return this.datasource.manager.delete(UserEntity, { id });
    }

    async editUser(id: number, user: Partial<UserEntity>) {
        return this.datasource.manager.transaction(async manager => {

            if (user.roles !== undefined) {
                user.roles = await this.roleRepo.findByIds(user.roles?.map(r => r.id) ?? []);
                return manager.save(UserEntity, { id, ...user });
            }

            return manager.update(UserEntity, { id }, user);
        });
    }

}