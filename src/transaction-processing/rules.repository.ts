import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategorizationRule, RulesRepository } from './categorization/categorization.service';

@Injectable()
export class PrismaRulesRepository implements RulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKeyword(keyword: string): Promise<CategorizationRule | null> {
    return this.prisma.categorizationRule.findUnique({
      where: { keyword },
      select: {
        id: true,
        keyword: true,
        categoryId: true,
        rule_type: true,
        createdAt: true,
        updatedAt: true,
        normalizedDescription: true
      }
    });
  }

  async create(ruleData: Omit<CategorizationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategorizationRule> {
    return this.prisma.categorizationRule.create({
      data: {
        id: crypto.randomUUID(),
        ...ruleData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        keyword: true,
        categoryId: true,
        rule_type: true,
        createdAt: true,
        updatedAt: true,
        normalizedDescription: true
      }
    });
  }
}