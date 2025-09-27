import { Injectable, Inject } from '@nestjs/common';

export interface CategorizationRule {
  keyword: string;
  categoryId: string;
  rule_type: string;
}

export interface Transaction {
  id: string;
  description: string;
  categoryId: string;
}

export interface RulesRepository {
  findByKeyword(keyword: string): Promise<CategorizationRule | null>;
  create(ruleData: Omit<CategorizationRule, 'id'>): Promise<CategorizationRule>;
}

@Injectable()
export class CategorizationService {
  constructor(
    @Inject('RULES_REPOSITORY') private readonly rulesRepository: RulesRepository,
  ) {}
  cleanDescription(description: string): string {
    // Remove common payment prefixes
    let cleaned = description.replace('PGTO* ', '');
    
    // Convert to Title Case
    cleaned = cleaned.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    
    return cleaned;
  }

  categorize(description: string, rules: CategorizationRule[]): string {
    // Convert description to lowercase for case-insensitive matching
    const lowerDescription = description.toLowerCase();
    
    // Loop through rules to find a match
    for (const rule of rules) {
      const lowerKeyword = rule.keyword.toLowerCase();
      
      // Check if description contains the keyword
      if (lowerDescription.includes(lowerKeyword)) {
        return rule.categoryId;
      }
    }
    
    // Return default uncategorized ID if no match found
    return 'cat_uncategorized';
  }

  private extractKeyword(description: string): string {
    // Convert to lowercase
    let keyword = description.toLowerCase();
    
    // Remove generic keywords
    const genericWords = ['compra', 'pagamento', 'fatura', 'brasil', 'ltda', 's.a.'];
    for (const word of genericWords) {
      keyword = keyword.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    }
    
    // Clean extra whitespace and extract meaningful keyword
    keyword = keyword.trim().replace(/\s+/g, ' ');
    
    // Extract the first meaningful word (usually the merchant name)
    const words = keyword.split(' ').filter(word => word.length > 2);
    return words.length > 0 ? words[0] : keyword;
  }

  public async learnFromManualCategorization(transaction: Transaction, newCategoryId: string): Promise<void> {
    // Extract and normalize keyword from transaction description
    const keyword = this.extractKeyword(transaction.description);
    
    // Check if rule already exists
    const existingRule = await this.rulesRepository.findByKeyword(keyword);
    
    // If rule doesn't exist, create a new one
    if (!existingRule) {
      await this.rulesRepository.create({
        keyword: keyword,
        categoryId: newCategoryId,
        rule_type: 'CONTAINS'
      });
    }
  }
}
