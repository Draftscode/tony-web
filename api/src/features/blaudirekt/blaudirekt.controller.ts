import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { type Response } from "express";
import { CompanyEntity } from "src/entities/company.entity";
import { DivisionEntity } from "src/entities/division.entity";
import { type QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { BlaudirektService } from "./blaudirekt.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles, SystemRole } from "src/common/decorators/roles.decorator";
import { User } from "../auth/data-access/authorized-request";
import { UserEntity } from "src/entities/user.entity";
import { NoteEntity } from "src/entities/note.entity";
@Controller('blaudirekt')
export class BlaudirektController {
  constructor(private readonly blaudirektService: BlaudirektService) { }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  refresh() {
    return this.blaudirektService.fetchDataFromBlaudirekt();
  }


  @UseGuards(JwtAuthGuard)
  @Put('notes/:noteId')
  editNote(
    @Param('noteId') noteId: string,
    @Body() note: Partial<NoteEntity>,
    @Query('customer') customerId: string,
  ) {
    return this.blaudirektService.editNote(customerId, noteId, note);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('notes/:noteId')
  removeNote(
    @Param('noteId') noteId: string,
  ) {
    return this.blaudirektService.removeNote(noteId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('notes')
  addNote(
    @Query('customer') customerId: string,
    @Body() note: Partial<NoteEntity>,
  ) {
    return this.blaudirektService.addNote(customerId, note);
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
    @Query('sortField') sortField: string,
    @Query('sortOrder', ParseIntPipe) sortOrder: number,
  ) {
    return this.blaudirektService.getCompanies({ offset, limit, query, sortField, sortOrder });
  }

  @UseGuards(JwtAuthGuard)
  @Get('divisions')
  getDivisions(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('q') query: string,
    @Query('sortField') sortField: string,
    @Query('sortOrder', ParseIntPipe) sortOrder: number,
  ) {
    return this.blaudirektService.getDivisions({ offset, limit, query, sortField, sortOrder });
  }

  @UseGuards(JwtAuthGuard)
  @Post('companies/:companyId')
  editCompany(
    @Param('companyId') companyId: string,
    @Body() companyDto: QueryDeepPartialEntity<CompanyEntity>
  ) {
    return this.blaudirektService.editCompany(companyId, companyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('division/:divisionId')
  editDivision(
    @Param('divisionId') divisionId: string,
    @Body() divisionDto: QueryDeepPartialEntity<DivisionEntity>
  ) {
    return this.blaudirektService.editDivision(divisionId, divisionDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.admin, SystemRole.customers)
  @Get('customers/:id')
  getCustomer(
    @Param('id') id: string,
  ) {
    return this.blaudirektService.getCustomer(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.admin, SystemRole.customers)
  @Get('customers')
  getCustomers(
    @User() user: UserEntity,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('q') query: string,
    @Query('sortField') sortField: string,
    @Query('filters') filters: string,
    @Query('sortOrder', ParseIntPipe) sortOrder: number,
  ) {
    const parsedFilters = JSON.parse(filters ?? {});
    return this.blaudirektService.getCustomers({
      offset,
      limit,
      query,
      sortField,
      sortOrder,
      filters: parsedFilters,
      brokers: user.brokers.map(broker => broker.id)
    });
  }

  @Get('status')
  getStatus() {
    return this.blaudirektService.getStatus();
  }

  @Get('synchronize')
  synchronize() {
    return this.blaudirektService.fetchDataFromBlaudirekt();
  }

  @Get('document/:id')
  async getDocument(@Param('id') id: string) {
    return this.blaudirektService.getDocument(id);
  }

  @Post('document')
  async addDocument(
    @Query('customer') customerId: string,
    @Body('contents') contents: string, @Res() res: Response) {
    const buffer = await this.blaudirektService.addDocument(customerId, contents);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="export.pdf"', // "inline" opens in browser tab
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}