import type { Relation } from 'typeorm';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FileEntity } from "./file.entity";
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

    @Column({ type: 'varchar', length: 300, nullable: true })
    password: string;

    @OneToMany(() => FileEntity, (file) => file.user)
    files: Relation<FileEntity[]>
}