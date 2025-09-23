import type { Relation } from 'typeorm';
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { ContractEntity } from "./contract.entity";

export type CustomerAddress = {
    city: string;
    livingSpace: any;
    nation: { id: string; text: string };
    street: string;
    streetNo: string;
    zip: string;
}

@Entity()
export class CustomerEntity {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    displayName: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ type: "jsonb", nullable: true })
    mainAddress: CustomerAddress;

    @OneToMany(() => ContractEntity, (contract) => contract.company)
    contracts: Relation<ContractEntity[]>;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    title: string;
}