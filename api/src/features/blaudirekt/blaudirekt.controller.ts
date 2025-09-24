import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BlaudirektService } from "./blaudirekt.service";

@Controller('blaudirekt')
export class BlaudirektController {
  constructor(private readonly blaudirektService: BlaudirektService) { }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  refresh() {
    return this.blaudirektService.fetchDataFromBlaudirekt();
  }

  @UseGuards(JwtAuthGuard)
  @Get('contracts/:customerId')
  getContracts(
    @Param('customerId') customerId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.blaudirektService.getContracts(customerId, offset, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('companies')
  getCompanies(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('q') query: string,
  ) {
    return this.blaudirektService.getCompanies(offset, limit, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customers')
  getCustomers(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('q') query: string,
  ) {
    return this.blaudirektService.getCustomers(offset, limit, query);
  }
}