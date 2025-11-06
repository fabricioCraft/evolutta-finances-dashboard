import {
  Controller,
  Patch,
  Param,
  Body,
  NotFoundException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategorizationService } from '../transaction-processing/categorization/categorization.service';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../auth/get-user.decorator';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

// DTO para validação dos dados de entrada
export class UpdateCategoryDto {
  categoryId: string;
}

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(
    private readonly categorizationService: CategorizationService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Patch(':id/categorize')
  async recategorizeTransaction(
    @Param('id') transactionId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    // Buscar a transação real do banco de dados
    const transaction = await this.transactionsService.findById(transactionId);

    // Verificar se a transação existe
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    // Atualizar a categoria da transação no banco de dados
    await this.transactionsService.updateCategory(
      transactionId,
      updateCategoryDto.categoryId,
    );

    // Chama o serviço de categorização para aprender com a categorização manual
    await this.categorizationService.learnFromManualCategorization(
      transaction,
      updateCategoryDto.categoryId,
    );

    return {
      message: 'Transaction recategorized successfully',
      transactionId,
      newCategoryId: updateCategoryDto.categoryId,
    };
  }

  @Get()
  async findAll(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser() user: User,
  ) {
    // Imprimir o ID do usuário no console para confirmar que funciona
    console.log('User ID:', user.id);

    // Converter strings de data para objetos Date, aplicando defaults para mês atual quando ausentes/invalidos
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const parsedStart = new Date(startDate as any);
    const parsedEnd = new Date(endDate as any);

    const startDateObj = isNaN(parsedStart.getTime())
      ? defaultStart
      : parsedStart;
    const endDateObj = isNaN(parsedEnd.getTime()) ? defaultEnd : parsedEnd;

    // Chamar o serviço com o userId e as datas convertidas
    return await this.transactionsService.findAllByDateRange(
      user.id,
      startDateObj,
      endDateObj,
    );
  }
}
