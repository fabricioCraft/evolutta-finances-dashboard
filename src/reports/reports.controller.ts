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
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    
    return this.reportsService.getMonthlySummary(yearNum, monthNum, user.id);
  }
}