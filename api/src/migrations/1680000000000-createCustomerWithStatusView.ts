import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerWithStatusView1680000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
         CREATE OR REPLACE VIEW customer_with_status AS
SELECT
    c.id,
    c."displayName",
    c.firstname,
    c.lastname,
    c."mainAddress",
    c.gender,
    c.title,
    c.blocked,
    c."blockReason",
    c."terminatedAt",
    c."isAlive",
    c.files,
    CASE
        WHEN c."isAlive" = false OR c.blocked = true OR c."terminatedAt" IS NOT NULL THEN 'terminated'
        WHEN COUNT(ct.id) = 0 THEN 'new'
        ELSE 'advanced'
    END AS status,
    COUNT(ct.id)::int AS "contractsCount",
    COUNT(l.id)::int AS "linkCount"
FROM customer_entity c
LEFT JOIN contract_entity ct ON ct."customerId" = c.id
LEFT JOIN link_entity l ON l."customerId" = c.id
GROUP BY c.id;

        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS customer_with_status;`);
    }
}
