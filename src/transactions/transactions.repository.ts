import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma.service';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

export interface ITransactionsRepository {
  findById(id: string): Promise<any>;
  updateCategory(id: string, categoryId: string): Promise<any>;
  findAllByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]>;
  findAll(userId: string): Promise<any[]>;
}

@Injectable()
export class PrismaTransactionsRepository implements ITransactionsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Busca uma transação específica pelo ID
   * @param id - ID da transação
   * @returns A transação encontrada ou null se não existir
   */
  async findById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('Transaction')
        .select('id, description, amount, categoryId, date, cleanedDescription')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TransactionsRepository] Falha ao buscar transação por ID (Supabase)', {
        id,
        error: message,
      });
      return null;
    }
  }

  /**
   * Atualiza a categoria de uma transação
   * @param id - ID da transação
   * @param categoryId - Nova categoria da transação
   * @returns A transação atualizada
   */
  async updateCategory(id: string, categoryId: string) {
    try {
      const { data, error } = await this.supabase
        .from('Transaction')
        .update({ categoryId })
        .eq('id', id)
        .select('id, description, amount, categoryId, date, cleanedDescription')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TransactionsRepository] Falha ao atualizar categoria (Supabase)', {
        id,
        categoryId,
        error: message,
      });
      return null;
    }
  }

  /**
   * Busca todas as transações de um usuário dentro de um intervalo de datas
   * @param userId - ID do usuário
   * @param startDate - Data inicial (inclusive)
   * @param endDate - Data final (inclusive)
   * @returns Array de transações encontradas no período para o usuário
   */
  async findAllByDateRange(userId: string, startDate: Date, endDate: Date) {
    try {
      const { data, error } = await this.supabase
        .from('Transaction')
        .select('id, description, amount, categoryId, date, cleanedDescription')
        .eq('userId', userId)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });

      if (error) throw error;
      return Array.isArray(data) ? (data as any[]) : [];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TransactionsRepository] Falha ao buscar transações por período (Supabase)', {
        userId,
        startDate,
        endDate,
        error: message,
      });
      return [];
    }
  }

  async findAll(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('Transaction')
        .select('id, description, amount, categoryId, date, cleanedDescription')
        .eq('userId', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return Array.isArray(data) ? (data as any[]) : [];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TransactionsRepository] Falha ao buscar todas transações por usuário (Supabase)', {
        userId,
        error: message,
      });
      return [];
    }
  }
}
