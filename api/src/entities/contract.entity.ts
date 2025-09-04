import type { Relation } from "typeorm";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { CompanyEntity } from "./company.entity";
import { CustomerEntity } from "./customer.entity";

export type Line = {
    group: string;
    id: string;
    text: string;
}

export type PaymentInfo = {
    grossAmount: number;
    interval: { id: string; text: string; };
    netAmount: number;
}

@Entity()
export class ContractEntity {
    @PrimaryColumn({ unique: true })
    id: string;

    @ManyToOne(() => CompanyEntity, (company) => company.contracts, { nullable: true })
    @JoinColumn({ name: "companyId" }) // defines the foreign key column
    company: Relation<CompanyEntity>;

    @ManyToOne(() => CustomerEntity, (customer) => customer.contracts, { nullable: true })
    @JoinColumn({ name: "customerId" }) // defines the foreign key column
    customer: Relation<CustomerEntity>;

    @Column({ nullable: true })
    companyId: string;

    @Column({ nullable: true })
    customerId: string;

    @Column({ type: 'jsonb' })
    line: Line;

    @Column({ type: 'jsonb' })
    payment: PaymentInfo;

    @Column()
    policyNumber: string;

    @Column({ nullable: true })
    risk: string;

    @Column({ nullable: true })
    start: string;

    @Column({ nullable: true })
    end: string;
}