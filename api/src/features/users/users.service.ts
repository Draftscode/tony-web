import { BadRequestException, Injectable } from "@nestjs/common";
import { UserEntity } from "src/entities/user.entity";
import { DataSource, ILike } from "typeorm";
import { encodePassword } from "../auth/auth.service";

@Injectable()
export class UsersService {
    constructor(private readonly datasource: DataSource) { }

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

    async findOne(username: string): Promise<UserEntity | null> {
        return this.datasource.manager.findOne(UserEntity, { where: { username } });
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
            return manager.update(UserEntity, { id }, user);
        });
    }

}