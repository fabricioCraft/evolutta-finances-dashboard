import { Injectable, Inject } from '@nestjs/common';
import type { ICategoriesRepository } from './categories.repository';

export interface CreateCategoryDto {
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
}
