import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { belvoProvider } from '../belvo/belvo.provider';
import { SupabaseModule } from '../supabase/supabase.module';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [ConfigModule, SupabaseModule, PrismaModule],
  providers: [ConnectionsService, belvoProvider],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
