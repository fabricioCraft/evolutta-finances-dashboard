import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ICategoriesRepository {
  create(createCategoryDto: { name: string }): Promise<any>;
}

@Injectable()
export class PrismaCategoriesRepository implements ICategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: { name: string }) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }
}