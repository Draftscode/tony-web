import type { FileData } from "src/features/files/files.model";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @BeforeInsert()
    setCreatedDate() {
        this.lastModified = new Date().toISOString();
    }

    @BeforeUpdate()
    updateTimestamp() {
        this.lastModified = new Date().toISOString();
    }
}