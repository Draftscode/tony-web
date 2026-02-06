import { Module } from "@nestjs/common";
import { NotesService } from "./notes.service";
import { NotesController } from "./notes.controller";

@Module({
    imports: [],
    exports: [NotesService],
    providers: [NotesService],
    controllers: [NotesController]
})
export class NotesModule { }