import { Money } from './Money';

/**
 * Tipos de regras de divisão de despesas
 */
export enum SplitType {
  EQUAL = 'equal', // Divisão igual entre os parceiros
  PROPORTIONAL = 'proportional', // Proporcional à renda
  FIXED = 'fixed', // Valores fixos por parceiro
  CUSTOM = 'custom', // Divisão personalizada
}

/**
 * Configuração de uma regra de divisão
 */
export interface SplitConfig {
  type: SplitType;
  partners: SplitPartner[];
  effectiveFrom: Date;
  effectiveUntil?: Date;
}

/**
 * Configuração de um parceiro na divisão
 */
export interface SplitPartner {
  partnerId: string;
  percentage?: number; // Para tipo PROPORTIONAL (0-100)
  fixedAmount?: Money; // Para tipo FIXED
  customAmount?: Money; // Para tipo CUSTOM
}

/**
 * Resultado da aplicação de uma regra de divisão
 */
export interface SplitResult {
  partnerId: string;
  amount: Money;
  percentage: number;
}

/**
 * Value Object para regras de divisão de despesas
 * Define como as transações são divididas entre os parceiros
 */
export class SplitRule {
  private readonly _config: SplitConfig;

  constructor(config: SplitConfig) {
    this.validateConfig(config);
    this._config = { ...config };
  }

  get type(): SplitType {
    return this._config.type;
  }

  get partners(): SplitPartner[] {
    return [...this._config.partners];
  }

  get effectiveFrom(): Date {
    return new Date(this._config.effectiveFrom);
  }

  get effectiveUntil(): Date | undefined {
    return this._config.effectiveUntil ? new Date(this._config.effectiveUntil) : undefined;
  }

  /**
   * Verifica se a regra está ativa em uma data específica
   */
  isActiveOn(date: Date): boolean {
    const checkDate = new Date(date);
    const fromDate = new Date(this._config.effectiveFrom);
    
    if (checkDate < fromDate) {
      return false;
    }

    if (this._config.effectiveUntil) {
      const untilDate = new Date(this._config.effectiveUntil);
      return checkDate <= untilDate;
    }

    return true;
  }

  /**
   * Aplica a regra de divisão a um valor monetário
   */
  split(amount: Money, partnerIncomes?: Map<string, Money>): SplitResult[] {
    this.validateAmount(amount);

    switch (this._config.type) {
      case SplitType.EQUAL:
        return this.splitEqually(amount);
      
      case SplitType.PROPORTIONAL:
        return this.splitProportionally(amount, partnerIncomes);
      
      case SplitType.FIXED:
        return this.splitByFixedAmounts(amount);
      
      case SplitType.CUSTOM:
        return this.splitByCustomAmounts(amount);
      
      default:
        throw new Error(`Unsupported split type: ${this._config.type}`);
    }
  }

  /**
   * Valida se a soma das divisões é igual ao valor total
   */
  validateSplit(totalAmount: Money, results: SplitResult[]): boolean {
    const sum = results.reduce((acc, result) => acc.add(result.amount), Money.zero(totalAmount.currency));
    return sum.equals(totalAmount);
  }

  toJSON(): SplitConfig {
    return {
      ...this._config,
      effectiveFrom: this._config.effectiveFrom.toISOString(),
      effectiveUntil: this._config.effectiveUntil?.toISOString(),
    };
  }

  private splitEqually(amount: Money): SplitResult[] {
    const partnerCount = this._config.partners.length;
    if (partnerCount === 0) {
      throw new Error('No partners defined for equal split');
    }

    const amountPerPartner = amount.divide(partnerCount);
    const percentagePerPartner = 100 / partnerCount;

    return this._config.partners.map(partner => ({
      partnerId: partner.partnerId,
      amount: amountPerPartner,
      percentage: percentagePerPartner,
    }));
  }

  private splitProportionally(amount: Money, partnerIncomes?: Map<string, Money>): SplitResult[] {
    if (!partnerIncomes) {
      throw new Error('Partner incomes required for proportional split');
    }

    let totalIncome = Money.zero(amount.currency);
    const validPartners: SplitPartner[] = [];

    // Calcular renda total e validar parceiros
    for (const partner of this._config.partners) {
      const income = partnerIncomes.get(partner.partnerId);
      if (!income) {
        throw new Error(`Income not found for partner ${partner.partnerId}`);
      }
      if (income.currency !== amount.currency) {
        throw new Error(`Income currency mismatch for partner ${partner.partnerId}`);
      }
      if (income.isNegative() || income.isZero()) {
        throw new Error(`Invalid income for partner ${partner.partnerId}: ${income.toString()}`);
      }
      
      totalIncome = totalIncome.add(income);
      validPartners.push(partner);
    }

    if (totalIncome.isZero()) {
      throw new Error('Total income cannot be zero');
    }

    return validPartners.map(partner => {
      const income = partnerIncomes.get(partner.partnerId)!;
      const percentage = (income.amount / totalIncome.amount) * 100;
      const partnerAmount = amount.multiply(percentage / 100);

      return {
        partnerId: partner.partnerId,
        amount: partnerAmount,
        percentage,
      };
    });
  }

  private splitByFixedAmounts(amount: Money): SplitResult[] {
    let totalFixedAmount = Money.zero(amount.currency);
    const validPartners: SplitPartner[] = [];

    // Validar parceiros com valores fixos
    for (const partner of this._config.partners) {
      if (!partner.fixedAmount) {
        throw new Error(`Fixed amount required for partner ${partner.partnerId}`);
      }
      if (partner.fixedAmount.currency !== amount.currency) {
        throw new Error(`Fixed amount currency mismatch for partner ${partner.partnerId}`);
      }
      if (partner.fixedAmount.isNegative()) {
        throw new Error(`Fixed amount cannot be negative for partner ${partner.partnerId}`);
      }

      totalFixedAmount = totalFixedAmount.add(partner.fixedAmount);
      validPartners.push(partner);
    }

    if (totalFixedAmount.isGreaterThan(amount)) {
      throw new Error('Total fixed amounts exceed the transaction amount');
    }

    // Se a soma dos valores fixos for menor que o total, distribuir a diferença igualmente
    const remainingAmount = amount.subtract(totalFixedAmount);
    const remainingPartnerCount = validPartners.length;
    const additionalAmountPerPartner = remainingAmount.divide(remainingPartnerCount);

    return validPartners.map(partner => {
      const finalAmount = partner.fixedAmount!.add(additionalAmountPerPartner);
      const percentage = (finalAmount.amount / amount.amount) * 100;

      return {
        partnerId: partner.partnerId,
        amount: finalAmount,
        percentage,
      };
    });
  }

  private splitByCustomAmounts(amount: Money): SplitResult[] {
    let totalCustomAmount = Money.zero(amount.currency);
    const validPartners: SplitPartner[] = [];

    // Validar parceiros com valores customizados
    for (const partner of this._config.partners) {
      if (!partner.customAmount) {
        throw new Error(`Custom amount required for partner ${partner.partnerId}`);
      }
      if (partner.customAmount.currency !== amount.currency) {
        throw new Error(`Custom amount currency mismatch for partner ${partner.partnerId}`);
      }

      totalCustomAmount = totalCustomAmount.add(partner.customAmount);
      validPartners.push(partner);
    }

    if (!totalCustomAmount.equals(amount)) {
      throw new Error('Sum of custom amounts must equal the transaction amount');
    }

    return validPartners.map(partner => {
      const percentage = (partner.customAmount!.amount / amount.amount) * 100;

      return {
        partnerId: partner.partnerId,
        amount: partner.customAmount!,
        percentage,
      };
    });
  }

  private validateConfig(config: SplitConfig): void {
    if (!config.type) {
      throw new Error('Split type is required');
    }

    if (!config.partners || config.partners.length === 0) {
      throw new Error('At least one partner is required');
    }

    if (!config.effectiveFrom) {
      throw new Error('Effective from date is required');
    }

    // Validar duplicatas de parceiros
    const partnerIds = config.partners.map(p => p.partnerId);
    const uniquePartnerIds = new Set(partnerIds);
    if (partnerIds.length !== uniquePartnerIds.size) {
      throw new Error('Duplicate partner IDs are not allowed');
    }

    // Validar configuração específica por tipo
    switch (config.type) {
      case SplitType.PROPORTIONAL:
        this.validateProportionalConfig(config);
        break;
      case SplitType.FIXED:
        this.validateFixedConfig(config);
        break;
      case SplitType.CUSTOM:
        this.validateCustomConfig(config);
        break;
    }
  }

  private validateProportionalConfig(config: SplitConfig): void {
    // Para proporcional, as porcentagens são calculadas dinamicamente baseadas na renda
    // Não precisamos validar porcentagens aqui
  }

  private validateFixedConfig(config: SplitConfig): void {
    for (const partner of config.partners) {
      if (!partner.fixedAmount) {
        throw new Error(`Fixed amount required for partner ${partner.partnerId}`);
      }
      if (partner.fixedAmount.isNegative()) {
        throw new Error(`Fixed amount cannot be negative for partner ${partner.partnerId}`);
      }
    }
  }

  private validateCustomConfig(config: SplitConfig): void {
    for (const partner of config.partners) {
      if (!partner.customAmount) {
        throw new Error(`Custom amount required for partner ${partner.partnerId}`);
      }
    }
  }

  private validateAmount(amount: Money): void {
    if (amount.isNegative()) {
      throw new Error('Cannot split negative amounts');
    }
    if (amount.isZero()) {
      throw new Error('Cannot split zero amounts');
    }
  }
}
