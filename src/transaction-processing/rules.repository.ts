import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategorizationRule, RulesRepository } from './categorization/categorization.service';

@Injectable()
export class PrismaRulesRepository implements RulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKeyword(keyword: string): Promise<CategorizationRule | null> {
    return this.prisma.categorizationRule.findUnique({
      where: { keyword }
    });
  }

  async create(ruleData: Omit<CategorizationRule, 'id'>): Promise<CategorizationRule> {
    return this.prisma.categorizationRule.create({
      data: ruleData
    });
  }
}