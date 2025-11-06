import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../auth/get-user.decorator';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-summary')
  async getMonthlySummary(
    @Query('year') year: string,
    @Query('month') month: string,
    @GetUser() user: User,
  ) {
    const now = new Date();
    const parsedYear = parseInt(year as any, 10);
    const parsedMonth = parseInt(month as any, 10);
    const yearNum = Number.isNaN(parsedYear) ? now.getFullYear() : parsedYear;
    const monthNum = Number.isNaN(parsedMonth)
      ? now.getMonth() + 1
      : parsedMonth;

    return this.reportsService.getMonthlySummary(yearNum, monthNum, user.id);
  }
}
