import { Injectable } from "@nestjs/common";
import { FileEntity } from "src/entities/file.entity";
import { MessageEntity } from "src/entities/message.entity";
import { NoteEntity } from "src/entities/note.entity";
import { UserEntity } from "src/entities/user.entity";
import { DataSource } from "typeorm";

@Injectable()
export class NotesService {
    constructor(private readonly dataSource: DataSource) { }

    async findNotes(file: string) {
        const [items, count] = await this.dataSource.manager.findAndCount(NoteEntity, { where: { file: { filename: file } } });

        return { items, total: count };
    }

    createNote(userId: number, note: Partial<NoteEntity> & { filename: string }) {
        return this.dataSource.manager.transaction(async manager => {
            const entity = manager.create(NoteEntity, note);
            const file = await manager.findOneOrFail(FileEntity, { where: { filename: note.filename } });
            entity.file = file;
            try {
                const givenUserId = file.user.id

                const users = await manager
                    .createQueryBuilder(UserEntity, 'user')
                    .leftJoin('user.users', 'relationUser') // adjust relation name if different
                    .where('relationUser.id IS NULL')
                    .orWhere('relationUser.id = :givenUserId', { givenUserId })
                    .getMany();
                const messageEntities = users
                    .filter(u => u.id !== userId)
                    .map(u => manager.create(MessageEntity, { message: { filename: note.filename, type: 'CHAT' }, user: u }));
                manager.save(MessageEntity, messageEntities);
            } catch { }

            return manager.save(entity);
        })
    }

    deleteNote(id: number) {
        return this.dataSource.manager.delete(NoteEntity, id);
    }
}