import { Column, Entity, OneToMany, PrimaryColumn, type Relation } from "typeorm";
import { ContractEntity } from "./contract.entity";

export type DivisionBlock = {
    key: string;
    description: string;
    placeholder: string;
}

@Entity()
export class DivisionEntity {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column({ nullable: true })
    text: string;

    @Column({ nullable: true })
    insuranceLineId: string;

    @Column({ nullable: true })
    group: string;

    @OneToMany(() => ContractEntity, (contract) => contract.division, { nullable: true })
    contracts: Relation<ContractEntity[]>;

    @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    blocks: DivisionBlock[];
}