import { Injectable, Inject } from '@nestjs/common';
import type { ICategoriesRepository } from './categories.repository';

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.categoriesRepository.create(createCategoryDto);
  }

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesRepository.update(id, updateCategoryDto);
  }

  async remove(id: string) {
    return this.categoriesRepository.remove(id);
  }
}
