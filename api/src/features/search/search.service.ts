import { Injectable } from "@nestjs/common";
import { DivisionEntity } from "src/entities/division.entity";
import { DataSource } from "typeorm";

@Injectable()
export class SearchService {
    constructor(private readonly dataSource: DataSource) { }

    async search(q: string) {
        const searchTerm = `%${q}%`;
        const limitPerTable = 20;

        const searchConfig = [
            { label: 'info', entity: DivisionEntity, column: 'text', value: 'info' },
            // { label: 'ip.asset', entity: IPAssetEntity },
            // { label: 'strategy', entity: FilingStrategyEntity },
            // { label: 'jurisdiction', entity: JurisdictionEntity },
            // { label: 'options', entity: ComplexityOptionEntity },
            // { label: 'offer.item', entity: JurisdictionEntity }
        ];

        const selectParts = searchConfig.map(config => {
            const tableName = this.dataSource.getMetadata(config.entity).tableName;
            // Das LIMIT wird hier in jeden einzelnen SELECT-Block geschrieben
            return `(SELECT id, ${config.column}, ${config.value}, '${config.label}' as kind 
                 FROM "${tableName}" 
                 WHERE ${config.column} ILIKE $1 
                 LIMIT ${limitPerTable})`;
        });

        // Die Klammern um die SELECTs sind bei UNION + LIMIT in PostgreSQL wichtig
        const finalQuery = selectParts.join(' UNION ALL ');

        const rawResults: { id: string | number; name: string; kind: string }[] =
            await this.dataSource.manager.query(finalQuery, [searchTerm]);

        const result = searchConfig.map(config => ({
            label: config.label,
            items: rawResults
                .filter(row => row.kind === config.label)
                .map(row => ({ id: row.id, name: row[config.column], value: row[config.value] }))
        }));

        return result.filter(group => group.items.length > 0);
    }
}