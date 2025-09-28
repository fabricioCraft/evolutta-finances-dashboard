import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaReportsRepository } from './reports.repository';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PrismaReportsRepository,
    {
      provide: 'IReportsRepository',
      useClass: PrismaReportsRepository,
    },
  ],
  exports: [ReportsService],
})
export class ReportsModule {}