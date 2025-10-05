import { v4 as uuidv4 } from 'uuid';
import { Money } from '../value-objects/Money';

/**
 * Tipos de envelope de orçamento
 */
export enum EnvelopeType {
  SHARED = 'shared', // Envelope compartilhado
  PERSONAL = 'personal', // Envelope pessoal
  GOAL = 'goal', // Envelope para metas
  EMERGENCY = 'emergency', // Envelope de emergência
}

/**
 * Períodos de orçamento
 */
export enum BudgetPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

/**
 * Configurações de rollover
 */
export interface RolloverSettings {
  enabled: boolean;
  maxAmount?: Money; // Limite máximo para rollover
  percentage?: number; // Porcentagem do não gasto que pode ser rolado
}

/**
 * Configurações de alerta
 */
export interface EnvelopeAlerts {
  enabled: boolean;
  warnAtPercentage: number; // Alerta quando X% do orçamento foi usado
  criticalAtPercentage: number; // Alerta crítico quando X% foi usado
  emailNotification: boolean;
  pushNotification: boolean;
}

/**
 * Entidade BudgetEnvelope - Representa um envelope de orçamento
 */
export class BudgetEnvelope {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _householdId: string;
  private _name: string;
  private _description?: string;
  private _type: EnvelopeType;
  private _categoryId?: string;
  private _ownerId?: string; // null = envelope compartilhado
  private _period: BudgetPeriod;
  private _limit: Money;
  private _spent: Money;
  private _rolloverSettings: RolloverSettings;
  private _alerts: EnvelopeAlerts;
  private _isActive: boolean;
  private _startDate: Date;
  private _endDate: Date;
  private _color?: string;
  private _icon?: string;
  private _tags: string[];
  private _metadata?: Record<string, any>;

  constructor(
    householdId: string,
    name: string,
    type: EnvelopeType,
    limit: Money,
    period: BudgetPeriod = BudgetPeriod.MONTHLY,
    ownerId?: string,
    id?: string
  ) {
    this._id = id || uuidv4();
    this._householdId = householdId;
    this._name = name;
    this._type = type;
    this._limit = limit;
    this._period = period;
    this._ownerId = ownerId;
    this._spent = Money.zero(limit.currency);
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._isActive = true;
    this._tags = [];

    // Configurar período
    this._startDate = this.calculateStartDate();
    this._endDate = this.calculateEndDate();

    // Configurações padrão
    this._rolloverSettings = {
      enabled: false,
    };

    this._alerts = {
      enabled: true,
      warnAtPercentage: 80,
      criticalAtPercentage: 95,
      emailNotification: true,
      pushNotification: true,
    };
  }

  get id(): string {
    return this._id;
  }

  get householdId(): string {
    return this._householdId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get type(): EnvelopeType {
    return this._type;
  }

  get categoryId(): string | undefined {
    return this._categoryId;
  }

  get ownerId(): string | undefined {
    return this._ownerId;
  }

  get period(): BudgetPeriod {
    return this._period;
  }

  get limit(): Money {
    return this._limit;
  }

  get spent(): Money {
    return this._spent;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get rolloverSettings(): RolloverSettings {
    return { ...this._rolloverSettings };
  }

  get alerts(): EnvelopeAlerts {
    return { ...this._alerts };
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get startDate(): Date {
    return new Date(this._startDate);
  }

  get endDate(): Date {
    return new Date(this._endDate);
  }

  get color(): string | undefined {
    return this._color;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Verifica se é um envelope compartilhado
   */
  isShared(): boolean {
    return this._type === EnvelopeType.SHARED || this._ownerId === undefined;
  }

  /**
   * Verifica se é um envelope pessoal
   */
  isPersonal(): boolean {
    return this._type === EnvelopeType.PERSONAL && this._ownerId !== undefined;
  }

  /**
   * Verifica se pertence a um parceiro específico
   */
  belongsTo(partnerId: string): boolean {
    return this._ownerId === partnerId;
  }

  /**
   * Calcula o valor disponível
   */
  getAvailable(): Money {
    return this._limit.subtract(this._spent);
  }

  /**
   * Calcula a porcentagem gasta
   */
  getSpentPercentage(): number {
    if (this._limit.isZero()) {
      return 0;
    }
    return (this._spent.amount / this._limit.amount) * 100;
  }

  /**
   * Calcula a porcentagem disponível
   */
  getAvailablePercentage(): number {
    return 100 - this.getSpentPercentage();
  }

  /**
   * Verifica se o envelope está dentro do orçamento
   */
  isUnderBudget(): boolean {
    return this._spent.isLessThanOrEqual(this._limit);
  }

  /**
   * Verifica se o envelope excedeu o orçamento
   */
  isOverBudget(): boolean {
    return this._spent.isGreaterThan(this._limit);
  }

  /**
   * Verifica se deve gerar alerta de aviso
   */
  shouldWarn(): boolean {
    if (!this._alerts.enabled) {
      return false;
    }

    const spentPercentage = this.getSpentPercentage();
    return spentPercentage >= this._alerts.warnAtPercentage && spentPercentage < this._alerts.criticalAtPercentage;
  }

  /**
   * Verifica se deve gerar alerta crítico
   */
  shouldAlertCritical(): boolean {
    if (!this._alerts.enabled) {
      return false;
    }

    const spentPercentage = this.getSpentPercentage();
    return spentPercentage >= this._alerts.criticalAtPercentage;
  }

  /**
   * Adiciona gasto ao envelope
   */
  addSpending(amount: Money): void {
    if (amount.currency !== this._limit.currency) {
      throw new Error('Spending amount currency must match envelope currency');
    }

    if (amount.isNegative()) {
      throw new Error('Spending amount cannot be negative');
    }

    this._spent = this._spent.add(amount);
    this._updatedAt = new Date();
  }

  /**
   * Remove gasto do envelope (para correções)
   */
  removeSpending(amount: Money): void {
    if (amount.currency !== this._limit.currency) {
      throw new Error('Spending amount currency must match envelope currency');
    }

    if (amount.isNegative()) {
      throw new Error('Spending amount cannot be negative');
    }

    this._spent = this._spent.subtract(amount);
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o limite do envelope
   */
  updateLimit(newLimit: Money): void {
    if (newLimit.currency !== this._limit.currency) {
      throw new Error('New limit currency must match envelope currency');
    }

    this._limit = newLimit;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o nome do envelope
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Envelope name cannot be empty');
    }

    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a descrição
   */
  updateDescription(newDescription: string | undefined): void {
    this._description = newDescription;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a categoria
   */
  updateCategory(categoryId: string | undefined): void {
    this._categoryId = categoryId;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza as configurações de rollover
   */
  updateRolloverSettings(newSettings: Partial<RolloverSettings>): void {
    this._rolloverSettings = { ...this._rolloverSettings, ...newSettings };
    this._updatedAt = new Date();
  }

  /**
   * Atualiza as configurações de alerta
   */
  updateAlerts(newAlerts: Partial<EnvelopeAlerts>): void {
    this._alerts = { ...this._alerts, ...newAlerts };
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a cor do envelope
   */
  updateColor(color: string | undefined): void {
    this._color = color;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o ícone do envelope
   */
  updateIcon(icon: string | undefined): void {
    this._icon = icon;
    this._updatedAt = new Date();
  }

  /**
   * Adiciona uma tag
   */
  addTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }

    const normalizedTag = tag.trim().toLowerCase();
    if (!this._tags.includes(normalizedTag)) {
      this._tags.push(normalizedTag);
      this._updatedAt = new Date();
    }
  }

  /**
   * Remove uma tag
   */
  removeTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    const index = this._tags.indexOf(normalizedTag);
    if (index !== -1) {
      this._tags.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  /**
   * Atualiza metadados
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...metadata };
    this._updatedAt = new Date();
  }

  /**
   * Reinicia o envelope para um novo período
   */
  resetForNewPeriod(): Money {
    const rolloverAmount = this.calculateRolloverAmount();
    
    // Resetar gastos
    this._spent = Money.zero(this._limit.currency);
    
    // Atualizar datas do período
    this._startDate = this.calculateStartDate();
    this._endDate = this.calculateEndDate();
    
    this._updatedAt = new Date();
    
    return rolloverAmount;
  }

  /**
   * Calcula o valor que pode ser rolado para o próximo período
   */
  private calculateRolloverAmount(): Money {
    if (!this._rolloverSettings.enabled) {
      return Money.zero(this._limit.currency);
    }

    const available = this.getAvailable();
    if (available.isNegative() || available.isZero()) {
      return Money.zero(this._limit.currency);
    }

    let rolloverAmount = available;

    // Aplicar limite máximo se definido
    if (this._rolloverSettings.maxAmount) {
      rolloverAmount = rolloverAmount.isLessThan(this._rolloverSettings.maxAmount) 
        ? rolloverAmount 
        : this._rolloverSettings.maxAmount;
    }

    // Aplicar porcentagem se definida
    if (this._rolloverSettings.percentage) {
      const percentageAmount = available.multiply(this._rolloverSettings.percentage / 100);
      rolloverAmount = rolloverAmount.isLessThan(percentageAmount) 
        ? rolloverAmount 
        : percentageAmount;
    }

    return rolloverAmount;
  }

  /**
   * Calcula a data de início do período atual
   */
  private calculateStartDate(): Date {
    const now = new Date();
    
    switch (this._period) {
      case BudgetPeriod.MONTHLY:
        return new Date(now.getFullYear(), now.getMonth(), 1);
      
      case BudgetPeriod.QUARTERLY:
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      
      case BudgetPeriod.YEARLY:
        return new Date(now.getFullYear(), 0, 1);
      
      case BudgetPeriod.CUSTOM:
      default:
        return new Date(now);
    }
  }

  /**
   * Calcula a data de fim do período atual
   */
  private calculateEndDate(): Date {
    const startDate = this.calculateStartDate();
    
    switch (this._period) {
      case BudgetPeriod.MONTHLY:
        return new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      case BudgetPeriod.QUARTERLY:
        return new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
      
      case BudgetPeriod.YEARLY:
        return new Date(startDate.getFullYear(), 11, 31);
      
      case BudgetPeriod.CUSTOM:
      default:
        return new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias
    }
  }

  /**
   * Verifica se o envelope está no período atual
   */
  isInCurrentPeriod(): boolean {
    const now = new Date();
    return now >= this._startDate && now <= this._endDate;
  }

  /**
   * Ativa o envelope
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Desativa o envelope
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Serializa o envelope para JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      householdId: this._householdId,
      name: this._name,
      description: this._description,
      type: this._type,
      categoryId: this._categoryId,
      ownerId: this._ownerId,
      period: this._period,
      limit: this._limit.toJSON(),
      spent: this._spent.toJSON(),
      available: this.getAvailable().toJSON(),
      spentPercentage: this.getSpentPercentage(),
      availablePercentage: this.getAvailablePercentage(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      rolloverSettings: this._rolloverSettings,
      alerts: this._alerts,
      isActive: this._isActive,
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      color: this._color,
      icon: this._icon,
      tags: this._tags,
      metadata: this._metadata,
      isShared: this.isShared(),
      isPersonal: this.isPersonal(),
      isUnderBudget: this.isUnderBudget(),
      isOverBudget: this.isOverBudget(),
      shouldWarn: this.shouldWarn(),
      shouldAlertCritical: this.shouldAlertCritical(),
      isInCurrentPeriod: this.isInCurrentPeriod(),
    };
  }
}
