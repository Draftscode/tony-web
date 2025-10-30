import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from "typeorm";
import { CustomerEntity } from "./customer.entity";

@Entity()
export class NoteEntity {
    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    type: string;

    @Column()
    author: string;

    @Column()
    date: string;

    @Column()
    text: string;

    @Column()
    customerId: string;

    @ManyToOne(() => CustomerEntity, customer => customer.notes)
    @JoinColumn({ name: "customerId" })
    customer: Relation<CustomerEntity>;
}