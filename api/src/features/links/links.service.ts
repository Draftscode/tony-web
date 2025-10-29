import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { LinkEntity } from "src/entities/link.entity";
import { DataSource, LessThan, MoreThan } from "typeorm";

@Injectable()
export class LinksService {
    constructor(private readonly dataSource: DataSource) {
        this.removeExpiredLinks();
    }

    createLink<T>(customerId: number, data: T) {
        return this.dataSource.transaction(async manager => {
            const entity = manager.create(LinkEntity<T>, { data, customerId })
            return manager.save(entity);
        })
    }

    getLink<T>(link: string) {
        const nowIso = new Date().toISOString();
        return this.dataSource.manager.findOne(LinkEntity<T>, {
            where: {
                link,
                expirationTime: MoreThan(nowIso),
            },
            relations: {
                customer: true
            }
        });
    }

    removeLink<T>(id: number) {
        return this.dataSource.manager.delete(LinkEntity<T>, { id });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // cron: minute hour day-of-month month day-of-week
    async removeExpiredLinks() {
        const nowIso = new Date().toISOString();

        const result = await this.dataSource.manager.delete(LinkEntity, {
            expirationTime: LessThan(nowIso), // all links expired before now
        });

        Logger.debug(`Expired links removed: ${result.affected}`);
    }
}