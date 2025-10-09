import { Injectable } from "@nestjs/common";
import { IRoleRepository } from "../../common/contracts/roles-repository.interface";
import { RoleEntity } from "src/entities/roles.entity";
import { DataSource, In } from "typeorm";

@Injectable()
export class RoleService implements IRoleRepository {
    constructor(private readonly dataSource: DataSource) { }

    findByIds(roleIds: number[]): Promise<RoleEntity[]> {
        return this.dataSource.manager.findBy(RoleEntity, { id: In(roleIds) });
    }

    async getAllRoles() {
        const [items, total] = await this.dataSource.manager.findAndCount(RoleEntity, { where: {} });
        return { items, total };
    }
}