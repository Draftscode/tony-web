import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('message')
export class MessageEntity<T = unknown> {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({ type: 'jsonb', nullable: true })
    message: T;

    @ManyToOne(_ => UserEntity, user => user.messages, { nullable: true })
    user: Relation<UserEntity>;


    @Column({ default: new Date().toISOString() })
    createdAt: string;

    @Column({ default: false })
    read: boolean;
}