import type { Relation } from 'typeorm';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { ContractEntity } from "./contract.entity";
import { LinkEntity } from './link.entity';
import { BrokerEntity } from './broker.entity';
import { NoteEntity } from './note.entity';

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

  @OneToMany(() => ContractEntity, (contract) => contract.customer)
  contracts: Relation<ContractEntity[]>;

  @OneToMany(() => LinkEntity, (link) => link.customer)
  links: Relation<LinkEntity[]>;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  title: string;

  @Column({ default: false })
  blocked: boolean;

  @Column({ nullable: true })
  blockReason: string;

  @Column({ nullable: true })
  terminatedAt: string;

  @Column({ default: true })
  isAlive: boolean;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  files: string[];

  @Column({
    name: 'status',
    asExpression: `
      CASE
        WHEN "isAlive" = false OR "blocked" = true OR "terminatedAt" IS NOT NULL THEN 'terminated'
        ELSE 'advanced'
      END
    `,
    generatedType: 'STORED', // or 'VIRTUAL' depending on DB
  })
  status: string;


  @ManyToOne(() => BrokerEntity, (broker) => broker.customers)
  broker: Relation<BrokerEntity>;

  @OneToMany(() => NoteEntity, note => note.customer)
  notes: Relation<NoteEntity[]>;
}