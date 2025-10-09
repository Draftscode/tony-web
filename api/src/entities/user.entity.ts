import { Exclude } from 'class-transformer';
import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FileEntity } from "./file.entity";
import { RoleEntity } from './roles.entity';
@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    username: string;

    @Column({ nullable: true })
    firstname: string;

    @Column({ nullable: true })
    lastname: string;

    @Exclude()
    @Column({ type: 'varchar', length: 300, nullable: true, select: false })
    password: string;

    @ManyToMany(() => RoleEntity, role => role.users, { eager: true })
    @JoinTable() // Only one side of the relation needs @JoinTable
    roles: Relation<RoleEntity[]>;

    @OneToMany(() => FileEntity, (file) => file.user)
    files: Relation<FileEntity[]>
}