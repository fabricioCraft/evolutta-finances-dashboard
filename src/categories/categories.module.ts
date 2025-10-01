import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaCategoriesRepository } from './categories.repository';
import { PrismaModule } from '../prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: 'ICategoriesRepository',
      useClass: PrismaCategoriesRepository,
    },
  ],
})
export class CategoriesModule {}
