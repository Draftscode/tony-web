import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, UseGuards } from "@nestjs/common";
import { LinksService } from "./links.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";

type CreateLinkDto<T> = {
    data: T;
    customerId: number;
}

@Controller('link')
export class LinksController {
    constructor(private readonly linksService: LinksService) { }

    @UseGuards(JwtAuthGuard)
    @Put()
    createLink<T>(
        @Body() body: CreateLinkDto<T>,
    ) {
        return this.linksService.createLink(body.customerId, body.data);
    }

    @Get(':link')
    getLink(@Param('link') link: string) {
        return this.linksService.getLink(link);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    removeLink(@Param('id',ParseIntPipe) id: number) {
        return this.linksService.removeLink(id);
    }
}