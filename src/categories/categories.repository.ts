import { Inject, Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma.service';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

export interface Category {
  id: string;
  name: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoriesRepository {
  create(createCategoryDto: { name: string }, userId: string): Promise<any>;
  findAll(userId: string): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  update(id: string, data: { name: string }): Promise<Category>;
  remove(id: string): Promise<Category>;
}

@Injectable()
export class PrismaCategoriesRepository implements ICategoriesRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(createCategoryDto: { name: string }, userId: string) {
    try {
      const payload = {
        id: crypto.randomUUID(),
        name: createCategoryDto.name,
        userId,
        updatedAt: new Date().toISOString(),
      } as any;
      const { data, error } = await this.supabase
        .from('Category')
        .insert(payload)
        .select('id, name, userId, createdAt, updatedAt')
        .single();

      if (error) throw error;
      return data as Category;
    } catch (error: any) {
      console.error('[CategoriesRepository] Falha ao criar categoria (Supabase) - Detalhes:', {
        userId,
        createCategoryDto,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      throw error;
    }
  }

  async findAll(userId: string): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('Category')
        .select('id, name, userId, createdAt, updatedAt')
        .eq('userId', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data as Category[]) ?? [];
    } catch (error: any) {
      console.error('[CategoriesRepository] Falha ao listar categorias (Supabase) - Detalhes:', {
        userId,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      return [];
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await this.supabase
        .from('Category')
        .select('id, name, userId, createdAt, updatedAt')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as Category) ?? null;
    } catch (error: any) {
      console.error('[CategoriesRepository] Falha ao buscar categoria por ID (Supabase) - Detalhes:', {
        id,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      return null;
    }
  }

  async update(id: string, data: { name: string }): Promise<Category> {
    try {
      const { data: updated, error } = await this.supabase
        .from('Category')
        .update({ name: data.name, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select('id, name, userId, createdAt, updatedAt')
        .single();

      if (error) throw error;
      return updated as Category;
    } catch (error: any) {
      console.error('[CategoriesRepository] Falha ao atualizar categoria (Supabase) - Detalhes:', {
        id,
        data,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      throw error;
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('Category')
        .delete()
        .eq('id', id)
        .select('id, name, userId, createdAt, updatedAt')
        .single();

      if (error) throw error;
      return data as Category;
    } catch (error: any) {
      console.error('[CategoriesRepository] Falha ao remover categoria (Supabase) - Detalhes:', {
        id,
        message: error?.message || String(error),
        stack: error?.stack,
      });
      throw error;
    }
  }
}
