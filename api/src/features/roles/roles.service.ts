import { Injectable } from "@nestjs/common";
import { IRoleRepository } from "../../common/contracts/roles-repository.interface";
import { RoleEntity } from "src/entities/roles.entity";
import { DataSource, In } from "typeorm";

@Injectable()
export class RoleService implements IRoleRepository {
    constructor(private readonly dataSource: DataSource) {
        this.init();
    }

    init() {
        // return this.dataSource.transaction(async manager => {
        //     return manager.upsert(RoleEntity,
        //         [
        //             { name: 'admin' },
        //             { name: 'users' },
        //             { name: 'customers' },
        //             { name: 'divisions' },
        //             { name: 'insurers' },
        //         ],
        //         ['name'] // conflict target
        //     );
        // });
    }

    findByIds(roleIds: number[]): Promise<RoleEntity[]> {
        return this.dataSource.manager.findBy(RoleEntity, { id: In(roleIds) });
    }

    async getAllRoles() {
        const [items, total] = await this.dataSource.manager.findAndCount(RoleEntity, { where: {} });
        return { items, total };
    }
}