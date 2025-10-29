import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn, type Relation } from "typeorm";
import { CustomerEntity } from "./customer.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class BrokerEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string

    @Column({ nullable: true })
    logoId: string;

    @ManyToMany(() => UserEntity, user => user.brokers)
    users: Relation<UserEntity[]>;

    @OneToMany(() => CustomerEntity, customer => customer.broker)
    customers: Relation<CustomerEntity[]>;
}