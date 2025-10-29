import type { Relation } from "typeorm";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('role')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => UserEntity, user => user.roles)
    users: Relation<UserEntity[]>;
}