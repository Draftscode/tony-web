import type { Relation } from "typeorm";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { ContractEntity } from "./contract.entity";

@Entity()
export class CompanyEntity {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    logoId: string;

    @Column({ nullable: true })
    logo: string;

    @OneToMany(() => ContractEntity, (contract) => contract.company)
    contracts: Relation<ContractEntity[]>;
}