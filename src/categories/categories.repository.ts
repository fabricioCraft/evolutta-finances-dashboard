import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: { name: string }, userId: string) {
    return this.prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        ...createCategoryDto,
        userId,
        updatedAt: new Date(),
      },
    });
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { name: string }): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Category> {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
