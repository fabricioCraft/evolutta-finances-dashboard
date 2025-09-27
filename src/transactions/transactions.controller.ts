import { Controller, Patch, Param, Body } from '@nestjs/common';
import { CategorizationService } from '../transaction-processing/categorization/categorization.service';

// DTO para validação dos dados de entrada
export class UpdateCategoryDto {
  categoryId: string;
}

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly categorizationService: CategorizationService) {}

  @Patch(':id/categorize')
  async recategorizeTransaction(
    @Param('id') transactionId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    // TODO: Na implementação final, buscar a transação real do banco de dados usando o transactionId
    // const transaction = await this.transactionService.findById(transactionId);
    
    // Por enquanto, usando um objeto mockado para demonstração
    const mockTransaction = {
      id: transactionId,
      description: 'Compra no supermercado XYZ',
      amount: -150.00,
      date: new Date(),
      categoryId: 'uncategorized'
    };

    // Chama o serviço de categorização para aprender com a categorização manual
    await this.categorizationService.learnFromManualCategorization(
      mockTransaction,
      updateCategoryDto.categoryId,
    );

    return {
      message: 'Transaction recategorized successfully',
      transactionId,
      newCategoryId: updateCategoryDto.categoryId,
    };
  }
}
