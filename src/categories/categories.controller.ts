import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../auth/get-user.decorator';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoriesService.create(createCategoryDto, user.id);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.categoriesService.findAll(user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @GetUser() user: User) {
    return this.categoriesService.remove(id, user.id);
  }
}
