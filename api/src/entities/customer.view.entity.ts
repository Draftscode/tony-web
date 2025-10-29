import { DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'customer_with_status',
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('c.id', 'id')
      .addSelect('c."displayName"', 'displayName')
      .addSelect('c.firstname', 'firstname')
      .addSelect('c.lastname', 'lastname')
      .addSelect('c."mainAddress"', 'mainAddress')
      .addSelect('c.gender', 'gender')
      .addSelect('c.title', 'title')
      .addSelect('c.blocked', 'blocked')
      .addSelect('c."blockReason"', 'blockReason')
      .addSelect('c."terminatedAt"', 'terminatedAt')
      .addSelect('c."isAlive"', 'isAlive')
      .addSelect('c.files', 'files')
      .addSelect('c."brokerId"', 'brokerId')
      // Compute status
      .addSelect(`
        CASE
          WHEN c."isAlive" = false OR c.blocked = true OR c."terminatedAt" IS NOT NULL THEN 'terminated'
          WHEN COUNT(ct.id) = 0 THEN 'new'
          ELSE 'advanced'
        END
      `, 'status')
      .addSelect('COUNT(ct.id)', 'contractsCount')
      .addSelect('COUNT(l.id)', 'linkCount')
      .from('customer_entity', 'c')
      .leftJoin('contract_entity', 'ct', 'ct."customerId" = c.id')
      .leftJoin('link_entity', 'l', 'l."customerId" = c.id')
      .groupBy('c.id'),
})
export class CustomerWithStatusView {
  @ViewColumn() id: string;
  @ViewColumn() displayName: string;
  @ViewColumn() firstname: string;
  @ViewColumn() lastname: string;
  @ViewColumn() mainAddress: any;
  @ViewColumn() gender: string;
  @ViewColumn() title: string;
  @ViewColumn() blocked: boolean;
  @ViewColumn() blockReason: string;
  @ViewColumn() terminatedAt: string;
  @ViewColumn() isAlive: boolean;
  @ViewColumn() files: string[];
  @ViewColumn() status: 'terminated' | 'new' | 'advanced';
  @ViewColumn() contractsCount: string;
  @ViewColumn() linkCount: string;
  @ViewColumn() brokerId: string; // 👈 add this column
}
