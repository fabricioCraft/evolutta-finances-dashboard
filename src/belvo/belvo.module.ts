import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BelvoController } from './belvo.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [HttpModule, AuthModule, SupabaseModule],
  controllers: [BelvoController],
})
export class BelvoModule {}