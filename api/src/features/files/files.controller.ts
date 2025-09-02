import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { FileEntity } from "src/entities/file.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FilesService } from "./files.service";

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