import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { SearchService } from "./search.service";

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @UseGuards(JwtAuthGuard)
    @Get('')
    search(@Query('q') q: string) {
        return this.searchService.search(q)
    }
}