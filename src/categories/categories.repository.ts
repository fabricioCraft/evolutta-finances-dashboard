import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoriesRepository {
  create(createCategoryDto: { name: string }): Promise<any>;
  findAll(): Promise<Category[]>;
  update(id: string, data: { name: string }): Promise<Category>;
  remove(id: string): Promise<Category>;
}

@Injectable()
export class PrismaCategoriesRepository implements ICategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: { name: string }) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
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