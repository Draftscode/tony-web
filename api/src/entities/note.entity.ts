import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { FileEntity } from "./file.entity";
import { UserEntity } from "./user.entity";

@Entity('note')
export class NoteEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    text: string;

    @Column({ default: new Date().toISOString() })
    createdAt: string;

    @Column({ nullable: true })
    fileId: number;

    @Column({ nullable: true })
    userId: number;

    @ManyToOne(_ => UserEntity, user => user.notes, { nullable: false, eager: true })
    @JoinColumn({ name: 'userId' })
    user: Relation<UserEntity>;

    @ManyToOne(_ => FileEntity, file => file.notes, { nullable: true, eager: true })
    @JoinColumn({ name: 'fileId' })
    file: Relation<FileEntity>;

    @BeforeInsert()
    setCreatedDate() {
        this.createdAt = new Date().toISOString();
    }
}