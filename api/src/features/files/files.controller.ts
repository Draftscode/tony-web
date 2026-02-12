import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { File } from "buffer";
import type { Request, Response } from "express";
import { FileEntity } from "src/entities/file.entity";
import { UserEntity } from "src/entities/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { User } from "../auth/data-access/authorized-request";
import { FilesService, ImportedFile, ImportedFileWrapper } from "./files.service";

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getFiles(
        @User() user: UserEntity,
        @Query('q') query: string,
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number) {
        return this.filesService.getAll(query, user, { limit, offset });
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
        @Req() req: Request,
        @User() user: UserEntity,
    ) {
        return this.filesService.createOrUpdateFile(filename, file, user)
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
    async createPdf(
        @User() user: UserEntity,
        @Body('contents') contents: string,
        @Res() res: Response) {
        const buffer = await this.filesService.createPdf(contents, { logo: user.logo });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="export.pdf"', // "inline" opens in browser tab
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }
}