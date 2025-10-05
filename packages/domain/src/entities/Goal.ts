import { v4 as uuidv4 } from 'uuid';
import { Money } from '../value-objects/Money';

/**
 * Tipos de meta
 */
export enum GoalType {
  TRAVEL = 'travel', // Viagem
  FERTILIZATION = 'fertilization', // Fertilização
  ADOPTION = 'adoption', // Adoção
  HOME_PURCHASE = 'home_purchase', // Compra de casa
  EDUCATION = 'education', // Educação
  EMERGENCY_FUND = 'emergency_fund', // Fundo de emergência
  RETIREMENT = 'retirement', // Aposentadoria
  CUSTOM = 'custom', // Personalizada
}

/**
 * Status da meta
 */
export enum GoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Frequência de contribuição automática
 */
export enum ContributionFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Configuração de contribuição automática
 */
export interface AutoContributionRule {
  enabled: boolean;
  frequency: ContributionFrequency;
  amount: Money;
  startDate: Date;
  endDate?: Date;
  isShared: boolean; // true = contribuição compartilhada, false = individual
}

/**
 * Progresso da meta
 */
export interface GoalProgress {
  currentAmount: Money;
  targetAmount: Money;
  percentage: number;
  expectedCompletionDate?: Date;
  isOnTrack: boolean;
  lastUpdated: Date;
}

/**
 * Histórico de contribuições
 */
export interface ContributionHistory {
  id: string;
  date: Date;
  amount: Money;
  contributorId: string;
  contributorName: string;
  isAutoContribution: boolean;
  notes?: string;
}

/**
 * Entidade Goal - Representa uma meta financeira
 */
export class Goal {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _householdId: string;
  private _name: string;
  private _description?: string;
  private _type: GoalType;
  private _targetAmount: Money;
  private _currentAmount: Money;
  private _targetDate: Date;
  private _status: GoalStatus;
  private _ownerIds: string[]; // IDs dos parceiros que possuem a meta
  private _autoContribution: AutoContributionRule;
  private _contributionHistory: ContributionHistory[];
  private _tags: string[];
  private _metadata?: Record<string, any>;
  private _color?: string;
  private _icon?: string;

  constructor(
    householdId: string,
    name: string,
    type: GoalType,
    targetAmount: Money,
    targetDate: Date,
    ownerIds: string[],
    id?: string
  ) {
    this._id = id || uuidv4();
    this._householdId = householdId;
    this._name = name;
    this._type = type;
    this._targetAmount = targetAmount;
    this._currentAmount = Money.zero(targetAmount.currency);
    this._targetDate = new Date(targetDate);
    this._ownerIds = [...ownerIds];
    this._status = GoalStatus.ACTIVE;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._contributionHistory = [];
    this._tags = [];

    // Configuração padrão de contribuição automática
    this._autoContribution = {
      enabled: false,
      frequency: ContributionFrequency.MONTHLY,
      amount: Money.zero(targetAmount.currency),
      startDate: new Date(),
      isShared: true,
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

  get type(): GoalType {
    return this._type;
  }

  get targetAmount(): Money {
    return this._targetAmount;
  }

  get currentAmount(): Money {
    return this._currentAmount;
  }

  get targetDate(): Date {
    return new Date(this._targetDate);
  }

  get status(): GoalStatus {
    return this._status;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get ownerIds(): string[] {
    return [...this._ownerIds];
  }

  get autoContribution(): AutoContributionRule {
    return { ...this._autoContribution };
  }

  get contributionHistory(): ContributionHistory[] {
    return [...this._contributionHistory];
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  get color(): string | undefined {
    return this._color;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  /**
   * Verifica se a meta está ativa
   */
  isActive(): boolean {
    return this._status === GoalStatus.ACTIVE;
  }

  /**
   * Verifica se a meta está pausada
   */
  isPaused(): boolean {
    return this._status === GoalStatus.PAUSED;
  }

  /**
   * Verifica se a meta foi completada
   */
  isCompleted(): boolean {
    return this._status === GoalStatus.COMPLETED;
  }

  /**
   * Verifica se a meta foi cancelada
   */
  isCancelled(): boolean {
    return this._status === GoalStatus.CANCELLED;
  }

  /**
   * Verifica se a meta é compartilhada
   */
  isShared(): boolean {
    return this._ownerIds.length > 1;
  }

  /**
   * Verifica se a meta pertence a um parceiro específico
   */
  belongsTo(partnerId: string): boolean {
    return this._ownerIds.includes(partnerId);
  }

  /**
   * Calcula o progresso da meta
   */
  getProgress(): GoalProgress {
    const percentage = this._targetAmount.isZero() ? 0 : (this._currentAmount.amount / this._targetAmount.amount) * 100;
    const isOnTrack = this.calculateIsOnTrack();
    const expectedCompletionDate = this.calculateExpectedCompletionDate();

    return {
      currentAmount: this._currentAmount,
      targetAmount: this._targetAmount,
      percentage: Math.min(percentage, 100),
      expectedCompletionDate,
      isOnTrack,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calcula o valor restante para completar a meta
   */
  getRemainingAmount(): Money {
    return this._targetAmount.subtract(this._currentAmount);
  }

  /**
   * Calcula a porcentagem de progresso
   */
  getProgressPercentage(): number {
    if (this._targetAmount.isZero()) {
      return 0;
    }
    return Math.min((this._currentAmount.amount / this._targetAmount.amount) * 100, 100);
  }

  /**
   * Calcula se a meta está no prazo
   */
  private calculateIsOnTrack(): boolean {
    if (this.isCompleted()) {
      return true;
    }

    const now = new Date();
    const timeElapsed = now.getTime() - this._createdAt.getTime();
    const totalTime = this._targetDate.getTime() - this._createdAt.getTime();

    if (totalTime <= 0) {
      return false;
    }

    const progressExpected = (timeElapsed / totalTime) * 100;
    const actualProgress = this.getProgressPercentage();

    return actualProgress >= progressExpected * 0.9; // 90% da expectativa
  }

  /**
   * Calcula a data esperada de conclusão
   */
  private calculateExpectedCompletionDate(): Date | undefined {
    if (this.isCompleted()) {
      return this._targetDate;
    }

    const progress = this.getProgressPercentage();
    if (progress === 0) {
      return undefined;
    }

    const now = new Date();
    const timeElapsed = now.getTime() - this._createdAt.getTime();
    const estimatedTotalTime = (timeElapsed / progress) * 100;
    const estimatedCompletionDate = new Date(this._createdAt.getTime() + estimatedTotalTime);

    return estimatedCompletionDate;
  }

  /**
   * Adiciona uma contribuição à meta
   */
  addContribution(
    amount: Money,
    contributorId: string,
    contributorName: string,
    isAutoContribution: boolean = false,
    notes?: string
  ): void {
    if (this.isCompleted()) {
      throw new Error('Cannot add contribution to completed goal');
    }

    if (this.isCancelled()) {
      throw new Error('Cannot add contribution to cancelled goal');
    }

    if (amount.currency !== this._targetAmount.currency) {
      throw new Error('Contribution currency must match goal currency');
    }

    if (amount.isNegative() || amount.isZero()) {
      throw new Error('Contribution amount must be positive');
    }

    // Verificar se a contribuição não excede o valor restante
    const remainingAmount = this.getRemainingAmount();
    if (amount.isGreaterThan(remainingAmount)) {
      throw new Error('Contribution exceeds remaining amount needed');
    }

    this._currentAmount = this._currentAmount.add(amount);
    this._updatedAt = new Date();

    // Adicionar ao histórico
    const contribution: ContributionHistory = {
      id: uuidv4(),
      date: new Date(),
      amount,
      contributorId,
      contributorName,
      isAutoContribution,
      notes,
    };

    this._contributionHistory.push(contribution);

    // Verificar se a meta foi completada
    if (this._currentAmount.isGreaterThanOrEqual(this._targetAmount)) {
      this._status = GoalStatus.COMPLETED;
      this._currentAmount = this._targetAmount; // Garantir que não exceda
    }
  }

  /**
   * Remove uma contribuição (para correções)
   */
  removeContribution(contributionId: string): void {
    const index = this._contributionHistory.findIndex(c => c.id === contributionId);
    if (index === -1) {
      throw new Error('Contribution not found');
    }

    const contribution = this._contributionHistory[index];
    this._currentAmount = this._currentAmount.subtract(contribution.amount);
    this._contributionHistory.splice(index, 1);
    this._updatedAt = new Date();

    // Se estava completada, voltar para ativa
    if (this._status === GoalStatus.COMPLETED) {
      this._status = GoalStatus.ACTIVE;
    }
  }

  /**
   * Atualiza o nome da meta
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Goal name cannot be empty');
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
   * Atualiza o valor alvo
   */
  updateTargetAmount(newTargetAmount: Money): void {
    if (newTargetAmount.currency !== this._targetAmount.currency) {
      throw new Error('Target amount currency must match goal currency');
    }

    if (newTargetAmount.isNegative() || newTargetAmount.isZero()) {
      throw new Error('Target amount must be positive');
    }

    this._targetAmount = newTargetAmount;
    this._updatedAt = new Date();

    // Se o valor atual já excede o novo alvo, marcar como completada
    if (this._currentAmount.isGreaterThanOrEqual(this._targetAmount)) {
      this._status = GoalStatus.COMPLETED;
      this._currentAmount = this._targetAmount;
    }
  }

  /**
   * Atualiza a data alvo
   */
  updateTargetDate(newTargetDate: Date): void {
    this._targetDate = new Date(newTargetDate);
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o status da meta
   */
  updateStatus(newStatus: GoalStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  /**
   * Adiciona um parceiro como dono da meta
   */
  addOwner(partnerId: string): void {
    if (this._ownerIds.includes(partnerId)) {
      throw new Error('Partner is already an owner of this goal');
    }

    this._ownerIds.push(partnerId);
    this._updatedAt = new Date();
  }

  /**
   * Remove um parceiro como dono da meta
   */
  removeOwner(partnerId: string): void {
    const index = this._ownerIds.indexOf(partnerId);
    if (index === -1) {
      throw new Error('Partner is not an owner of this goal');
    }

    if (this._ownerIds.length === 1) {
      throw new Error('Goal must have at least one owner');
    }

    this._ownerIds.splice(index, 1);
    this._updatedAt = new Date();
  }

  /**
   * Atualiza as configurações de contribuição automática
   */
  updateAutoContribution(newSettings: Partial<AutoContributionRule>): void {
    this._autoContribution = { ...this._autoContribution, ...newSettings };
    this._updatedAt = new Date();
  }

  /**
   * Habilita contribuição automática
   */
  enableAutoContribution(): void {
    this._autoContribution.enabled = true;
    this._updatedAt = new Date();
  }

  /**
   * Desabilita contribuição automática
   */
  disableAutoContribution(): void {
    this._autoContribution.enabled = false;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a cor da meta
   */
  updateColor(color: string | undefined): void {
    this._color = color;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o ícone da meta
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
   * Pausa a meta
   */
  pause(): void {
    if (this.isCompleted()) {
      throw new Error('Cannot pause completed goal');
    }

    this._status = GoalStatus.PAUSED;
    this._updatedAt = new Date();
  }

  /**
   * Resume a meta pausada
   */
  resume(): void {
    if (!this.isPaused()) {
      throw new Error('Only paused goals can be resumed');
    }

    this._status = GoalStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  /**
   * Cancela a meta
   */
  cancel(): void {
    if (this.isCompleted()) {
      throw new Error('Cannot cancel completed goal');
    }

    this._status = GoalStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  /**
   * Marca a meta como completada
   */
  complete(): void {
    this._status = GoalStatus.COMPLETED;
    this._currentAmount = this._targetAmount;
    this._updatedAt = new Date();
  }

  /**
   * Obtém o histórico de contribuições em um período
   */
  getContributionsInPeriod(startDate: Date, endDate: Date): ContributionHistory[] {
    return this._contributionHistory.filter(contribution => {
      const contributionDate = new Date(contribution.date);
      return contributionDate >= startDate && contributionDate <= endDate;
    });
  }

  /**
   * Obtém as últimas N contribuições
   */
  getRecentContributions(limit: number = 10): ContributionHistory[] {
    return this._contributionHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  /**
   * Calcula o total de contribuições de um parceiro
   */
  getPartnerContributions(partnerId: string): Money {
    return this._contributionHistory
      .filter(contribution => contribution.contributorId === partnerId)
      .reduce((total, contribution) => total.add(contribution.amount), Money.zero(this._targetAmount.currency));
  }

  /**
   * Serializa a meta para JSON
   */
  toJSON(): Record<string, any> {
    const progress = this.getProgress();
    
    return {
      id: this._id,
      householdId: this._householdId,
      name: this._name,
      description: this._description,
      type: this._type,
      targetAmount: this._targetAmount.toJSON(),
      currentAmount: this._currentAmount.toJSON(),
      targetDate: this._targetDate.toISOString(),
      status: this._status,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      ownerIds: this._ownerIds,
      autoContribution: {
        ...this._autoContribution,
        amount: this._autoContribution.amount.toJSON(),
        startDate: this._autoContribution.startDate.toISOString(),
        endDate: this._autoContribution.endDate?.toISOString(),
      },
      contributionHistory: this._contributionHistory.map(contribution => ({
        ...contribution,
        amount: contribution.amount.toJSON(),
        date: contribution.date.toISOString(),
      })),
      tags: this._tags,
      metadata: this._metadata,
      color: this._color,
      icon: this._icon,
      progress: {
        ...progress,
        currentAmount: progress.currentAmount.toJSON(),
        targetAmount: progress.targetAmount.toJSON(),
        expectedCompletionDate: progress.expectedCompletionDate?.toISOString(),
        lastUpdated: progress.lastUpdated.toISOString(),
      },
      remainingAmount: this.getRemainingAmount().toJSON(),
      progressPercentage: this.getProgressPercentage(),
      isActive: this.isActive(),
      isPaused: this.isPaused(),
      isCompleted: this.isCompleted(),
      isCancelled: this.isCancelled(),
      isShared: this.isShared(),
    };
  }
}
