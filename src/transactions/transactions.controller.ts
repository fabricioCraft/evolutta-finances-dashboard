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
    @Query('ignoreDate') ignoreDate: string,
    @GetUser() user: User,
  ) {
    // Imprimir o ID do usuário no console para confirmar que funciona
    console.log('User ID:', user.id);

    // Converter strings de data para objetos Date, aplicando defaults para mês atual quando ausentes/invalidos
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    defaultStart.setHours(0, 0, 0, 0);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    defaultEnd.setHours(23, 59, 59, 999);

    const parsedStart = new Date(startDate as any);
    const parsedEnd = new Date(endDate as any);

    const startDateObj = isNaN(parsedStart.getTime())
      ? defaultStart
      : new Date(parsedStart.setHours(0, 0, 0, 0));
    const endDateObj = isNaN(parsedEnd.getTime())
      ? defaultEnd
      : new Date(parsedEnd.setHours(23, 59, 59, 999));

    // Fallback de diagnóstico: ignorar filtro de data quando explicitamente solicitado
    if (ignoreDate === 'true') {
      console.warn('[TransactionsController] Ignorando filtro de data por ignoreDate=true');
      return await this.transactionsService.findAll(user.id);
    }

    // Chamar o serviço com o userId e as datas convertidas
    const results = await this.transactionsService.findAllByDateRange(
      user.id,
      startDateObj,
      endDateObj,
    );

    // Diagnóstico adicional: se não houver resultados e nenhum intervalo explícito foi enviado,
    // retornar todas as transações do usuário para confirmar conexão/dados.
    const hasExplicitRange = Boolean(startDate) || Boolean(endDate);
    if (!hasExplicitRange && results.length === 0) {
      console.warn('[TransactionsController] Nenhum resultado no período padrão; retornando todas as transações para diagnóstico');
      return await this.transactionsService.findAll(user.id);
    }

    return results;
  }
}
