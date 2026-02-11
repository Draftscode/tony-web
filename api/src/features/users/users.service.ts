import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { BROKER_REPOSITORY } from "src/common/contracts/broker-repository.interface";
import { UserEntity } from "src/entities/user.entity";
import { DataSource, ILike, In } from "typeorm";
import { ROLE_REPOSITORY } from "../../common/contracts/roles-repository.interface";
import type { IUserRepository, UserRepositoryOptions } from "../../common/contracts/user-repository.interface";
import { encodePassword } from "../auth/auth.service";
import { BrokerService } from "../broker/broker.service";
import { RoleService } from "../roles/roles.service";
import { RoleEntity } from "src/entities/roles.entity";

@Injectable()
export class UsersService implements IUserRepository {
    constructor(
        private readonly datasource: DataSource,
        @Inject(ROLE_REPOSITORY) private readonly roleRepo: RoleService,
        @Inject(BROKER_REPOSITORY) private readonly brokerRepo: BrokerService,
    ) {
        this.initializeApp();
    }

    async initializeApp() {
        await this.datasource.manager.transaction(async manager => {
            let e = await manager.findOne(UserEntity, { where: { username: 'admin' } });

            if (!e) {
                e = manager.create(UserEntity, { username: 'admin' });
            }

            await manager.upsert(RoleEntity, [
                { name: 'admin' },
                { name: 'insurers' },
                { name: 'customers' },
                { name: 'divisions' },
                { name: 'users' },
            ], {
                conflictPaths: ['name']
            });
            e.firstname = 'admin';
            e.lastname = '';
            e.roles = [await manager.findOneOrFail(RoleEntity, { where: { name: 'admin' } })]
            e.password = encodePassword('tonym');


            await manager.save(e);
        })
    }



    async getUser(id: number) {
        return this.datasource.manager.findOneOrFail(UserEntity, { where: { id }, relations: { users: true } });
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
        const [items, total] = await this.datasource.manager.findAndCount(UserEntity, { where: { username: ILike(`%${query}%`) }, relations: { users: true } });
        return { items, total };
    }

    async deleteUser(userId: number) {
        const userRepo = this.datasource.getRepository(UserEntity);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) return;

        try {
            await userRepo.delete(userId);
        } catch (err) {
            // If deletion fails due to FK constraints
            if (err.code === '23503') { // PostgreSQL foreign key violation
                user.archived = true;
                await userRepo.save(user);
            } else {
                throw err; // unexpected error
            }
        }
    }

    async findByIds(ids: number[]) {
        return this.datasource.manager.find(UserEntity, { where: { id: In(ids) } });
    }

    async editUser(id: number, user: Partial<UserEntity>) {
        return this.datasource.manager.transaction(async manager => {
            if (user.roles !== undefined) {
                user.roles = await this.roleRepo.findByIds(user.roles?.map(r => r.id) ?? []);
            }

            if (user.brokers !== undefined) {
                user.brokers = await this.brokerRepo.findByIds(user.brokers?.map(r => r.id) ?? []);
            }

            if (user.users !== undefined) {
                user.users = await this.findByIds(user.users.map(u => u.id));
            }

            delete user.password;
            return manager.save(UserEntity, { id, ...user });
        });
    }

}