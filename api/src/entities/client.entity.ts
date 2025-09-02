import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ClientEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    firstname: string;

    @Column({ type: 'varchar', length: 50 })
    lastname: string;
}