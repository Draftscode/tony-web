import { Injectable } from "@nestjs/common";
import { LinkEntity } from "src/entities/link.entity";
import { DataSource } from "typeorm";


@Injectable()
export class LinksService {
    constructor(private readonly dataSource: DataSource) { }

    createLink<T>(customerId: number, data: T) {
        return this.dataSource.transaction(async manager => {
            const entity = manager.create(LinkEntity<T>, { data, customerId })
            return manager.save(entity);
        })
    }

    getLink<T>(link: string) {
        return this.dataSource.manager.findOne(LinkEntity<T>, { where: { link }, relations: { customer: true } });
    }

    removeLink<T>(id: number) {
        console.log(id)
        return this.dataSource.manager.delete(LinkEntity<T>, { id });
    }
}