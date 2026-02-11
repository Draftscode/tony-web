import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { NoteEntity } from "src/entities/note.entity";
import { NotesService } from "./notes.service";
import { User } from "../auth/data-access/authorized-request";
import { UserEntity } from "src/entities/user.entity";

@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    @UseGuards(JwtAuthGuard)
    @Get('')
    getNotes(
        @Query('file') file: string,
    ) {
        return this.notesService.findNotes(file);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deleteNote(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.notesService.deleteNote(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('')
    createNote(
        @User() user: UserEntity,
        @Body() dto: Partial<NoteEntity> & { filename: string },
    ) {
        return this.notesService.createNote(user.id, dto);
    }
}