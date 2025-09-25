import type { FileData } from "src/features/files/files.model";
import type { Relation } from 'typeorm';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
@Entity()
export class FileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    filename: string;

    @Column({ default: new Date().toISOString() })
    lastModified: string;

    @Column({ type: "json" })
    data: FileData;

    @Column({ nullable: true })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.files, { nullable: true })
    @JoinColumn({ name: "userId" }) // defines the foreign key column
    user: Relation<UserEntity>;

    @BeforeInsert()
    setCreatedDate() {
        this.lastModified = new Date().toISOString();
    }

    @BeforeUpdate()
    updateTimestamp() {
        this.lastModified = new Date().toISOString();
    }
}