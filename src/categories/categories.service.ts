import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { ICategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    return this.categoriesRepository.create(createCategoryDto, userId);
  }

  async findAll(userId: string) {
    return this.categoriesRepository.findAll(userId);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    // Verificar se a categoria existe e se pertence ao usuário
    const category = await this.categoriesRepository.findById(id);
    
    if (!category) {
      throw new ForbiddenException('Category not found');
    }
    
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this category');
    }
    
    return this.categoriesRepository.update(id, updateCategoryDto as { name: string });
  }

  async remove(id: string, userId: string) {
    // Verificar se a categoria existe e se pertence ao usuário
    const category = await this.categoriesRepository.findById(id);
    
    if (!category) {
      throw new ForbiddenException('Category not found');
    }
    
    if (category.userId !== userId) {
      throw new ForbiddenException('You do not have permission to remove this category');
    }
    
    return this.categoriesRepository.remove(id);
  }
}
