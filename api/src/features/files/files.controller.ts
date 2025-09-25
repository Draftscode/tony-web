import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import type { Response } from "express";
import { FileEntity } from "src/entities/file.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FilesService, ImportedFile, ImportedFileWrapper } from "./files.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { File } from "buffer";

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getFiles(@Query('q') query: string) {
        return this.filesService.getAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':filename')
    getFile(@Param('filename') filename: string) {
        return this.filesService.getFile(filename);
    }

    @UseGuards(JwtAuthGuard)
    @Put('move')
    moveFile(
        @Body('fromPath') fromPath: string,
        @Body('toPath') toPath: string,
    ) {
        return this.filesService.moveFile(fromPath, toPath);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':filename')
    createOrUpdateFile(
        @Body() file: Partial<FileEntity>,
        @Param('filename') filename: string,
    ) {
        return this.filesService.createOrUpdateFile(filename, file)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':filename')
    removeFile(@Param('filename') filename: string) {
        return this.filesService.removeFile(filename);
    }

    @UseGuards(JwtAuthGuard)
    @Post('import')
    @UseInterceptors(FilesInterceptor('files', 10))
    importFiles(@UploadedFiles() files: File[]) {
        // ✅ Parse file contents (kept in memory by default if no storage config)
        try {
            const parsedFiles: ImportedFileWrapper[] = files.map(f => ({
                originalName: f['originalname'],
                size: f.size,
                content: JSON.parse(f['buffer'].toString()) as ImportedFile, // parse JSON directly
            }) as ImportedFileWrapper);

            return this.filesService.importFiles(parsedFiles);
        } catch (e) {
            throw new BadRequestException(e);
        }
    }




    @UseGuards(JwtAuthGuard)
    @Post('pdf')
    async createPdf(@Body('contents') contents: string, @Res() res: Response) {
        const buffer = await this.filesService.createPdf(contents);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="export.pdf"', // "inline" opens in browser tab
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }
}