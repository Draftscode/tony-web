import { Injectable } from "@nestjs/common";
import { FileEntity } from "src/entities/file.entity";
import { NoteEntity } from "src/entities/note.entity";
import { DataSource } from "typeorm";

@Injectable()
export class NotesService {
    constructor(private readonly dataSource: DataSource) { }

    async findNotes(file: string) {
        const [items, count] = await this.dataSource.manager.findAndCount(NoteEntity, { where: { file: { filename: file } } });

        return { items, total: count };
    }

    createNote(note: Partial<NoteEntity> & { filename: string }) {
        return this.dataSource.manager.transaction(async manager => {
            const entity = manager.create(NoteEntity, note);
            const file = await manager.findOneOrFail(FileEntity, { where: { filename: note.filename } });
            entity.file = file;
            return manager.save(entity);
        })
    }

    deleteNote(id: number) {
        return this.dataSource.manager.delete(NoteEntity, id);
    }
}