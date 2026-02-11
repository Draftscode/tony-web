import { Exclude } from 'class-transformer';
import type { Relation } from 'typeorm';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BrokerEntity } from './broker.entity';
import { FileEntity } from "./file.entity";
import { NoteEntity } from './note.entity';
import { RoleEntity } from './roles.entity';
@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
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

    @Column({ default: false })
    archived: boolean;

    @ManyToMany(() => BrokerEntity, broker => broker.users, { eager: true, nullable: true })
    @JoinTable()
    brokers: Relation<BrokerEntity[]>;

    @OneToMany(() => NoteEntity, note => note.user)
    notes: Relation<NoteEntity[]>;

    @ManyToMany(_ => UserEntity, user => user.users)
    @JoinTable()
    users: Relation<UserEntity[]>;

    @Column({ nullable: true })
    logo: string;

    @Column({ nullable: true })
    color: string;
}