import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma.service';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

export interface IReportsRepository {
  getSummaryByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<any>;
}

@Injectable()
export class PrismaReportsRepository implements IReportsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async getSummaryByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('Transaction')
        .select('amount, date')
        .eq('userId', userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (error) throw error;

      const txs = Array.isArray(data) ? (data as Array<{ amount: number; date: string }>) : [];
      const revenues = txs.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
      const expenses = txs.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
      const balance = revenues - expenses;

      return { revenues, expenses, balance };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[ReportsRepository] Falha ao calcular resumo por período (Supabase)', {
        userId,
        startDate,
        endDate,
        error: message,
      });
      return { revenues: 0, expenses: 0, balance: 0 };
    }
  }
}
