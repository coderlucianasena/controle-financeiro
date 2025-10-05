import { v4 as uuidv4 } from 'uuid';
import { SplitRule, SplitType } from '../value-objects/SplitRule';
import { Money } from '../value-objects/Money';

/**
 * Tipos de acordos financeiros
 */
export enum AgreementType {
  FIXED_EXPENSES = 'fixed_expenses', // Despesas fixas (aluguel, contas)
  VARIABLE_EXPENSES = 'variable_expenses', // Despesas variáveis (comida, lazer)
  SAVINGS = 'savings', // Poupança e investimentos
  DEBT_PAYMENT = 'debt_payment', // Pagamento de dívidas
  EMERGENCY_FUND = 'emergency_fund', // Fundo de emergência
  GOAL_CONTRIBUTION = 'goal_contribution', // Contribuição para metas
}

/**
 * Status do acordo
 */
export enum AgreementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

/**
 * Configurações de alerta do acordo
 */
export interface AgreementAlerts {
  enabled: boolean;
  thresholdPercentage: number; // 0-100, alerta quando desvio > X%
  emailNotification: boolean;
  pushNotification: boolean;
}

/**
 * Histórico de alterações do acordo
 */
export interface AgreementHistory {
  id: string;
  timestamp: Date;
  changedBy: string; // ID do parceiro que fez a alteração
  changeType: 'created' | 'updated' | 'suspended' | 'resumed' | 'terminated';
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
}

/**
 * Entidade Agreement - Representa um acordo financeiro entre os parceiros
 */
export class Agreement {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _householdId: string;
  private _type: AgreementType;
  private _name: string;
  private _description?: string;
  private _splitRule: SplitRule;
  private _status: AgreementStatus;
  private _effectiveFrom: Date;
  private _effectiveUntil?: Date;
  private _alerts: AgreementAlerts;
  private _history: AgreementHistory[];
  private _tags: string[];
  private _metadata?: Record<string, any>;

  constructor(
    householdId: string,
    type: AgreementType,
    name: string,
    splitRule: SplitRule,
    effectiveFrom: Date = new Date(),
    id?: string
  ) {
    this._id = id || uuidv4();
    this._householdId = householdId;
    this._type = type;
    this._name = name;
    this._splitRule = splitRule;
    this._status = AgreementStatus.ACTIVE;
    this._effectiveFrom = new Date(effectiveFrom);
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._tags = [];
    this._history = [];

    this._alerts = {
      enabled: true,
      thresholdPercentage: 10, // 10% de desvio
      emailNotification: true,
      pushNotification: true,
    };

    // Registrar criação no histórico
    this.addHistoryEntry('created', this._createdAt, 'system', 'Agreement created');
  }

  get id(): string {
    return this._id;
  }

  get householdId(): string {
    return this._householdId;
  }

  get type(): AgreementType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get splitRule(): SplitRule {
    return this._splitRule;
  }

  get status(): AgreementStatus {
    return this._status;
  }

  get effectiveFrom(): Date {
    return new Date(this._effectiveFrom);
  }

  get effectiveUntil(): Date | undefined {
    return this._effectiveUntil ? new Date(this._effectiveUntil) : undefined;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get alerts(): AgreementAlerts {
    return { ...this._alerts };
  }

  get history(): AgreementHistory[] {
    return [...this._history];
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Verifica se o acordo está ativo em uma data específica
   */
  isActiveOn(date: Date): boolean {
    if (this._status !== AgreementStatus.ACTIVE) {
      return false;
    }

    const checkDate = new Date(date);
    const fromDate = new Date(this._effectiveFrom);

    if (checkDate < fromDate) {
      return false;
    }

    if (this._effectiveUntil) {
      const untilDate = new Date(this._effectiveUntil);
      return checkDate <= untilDate;
    }

    return true;
  }

  /**
   * Verifica se o acordo está ativo atualmente
   */
  isActive(): boolean {
    return this.isActiveOn(new Date());
  }

  /**
   * Atualiza o nome do acordo
   */
  updateName(newName: string, changedBy: string, reason?: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Agreement name cannot be empty');
    }

    const previousName = this._name;
    this._name = newName.trim();
    this._updatedAt = new Date();

    this.addHistoryEntry('updated', this._updatedAt, changedBy, reason || 'Name updated', {
      name: previousName,
    }, {
      name: this._name,
    });
  }

  /**
   * Atualiza a descrição
   */
  updateDescription(newDescription: string | undefined, changedBy: string, reason?: string): void {
    const previousDescription = this._description;
    this._description = newDescription;
    this._updatedAt = new Date();

    this.addHistoryEntry('updated', this._updatedAt, changedBy, reason || 'Description updated', {
      description: previousDescription,
    }, {
      description: this._description,
    });
  }

  /**
   * Atualiza a regra de divisão
   */
  updateSplitRule(newSplitRule: SplitRule, changedBy: string, reason?: string): void {
    const previousSplitRule = this._splitRule.toJSON();
    this._splitRule = newSplitRule;
    this._updatedAt = new Date();

    this.addHistoryEntry('updated', this._updatedAt, changedBy, reason || 'Split rule updated', {
      splitRule: previousSplitRule,
    }, {
      splitRule: newSplitRule.toJSON(),
    });
  }

  /**
   * Atualiza o período de vigência
   */
  updateEffectivePeriod(
    newEffectiveFrom: Date,
    newEffectiveUntil: Date | undefined,
    changedBy: string,
    reason?: string
  ): void {
    const previousFrom = this._effectiveFrom;
    const previousUntil = this._effectiveUntil;

    this._effectiveFrom = new Date(newEffectiveFrom);
    this._effectiveUntil = newEffectiveUntil ? new Date(newEffectiveUntil) : undefined;
    this._updatedAt = new Date();

    this.addHistoryEntry('updated', this._updatedAt, changedBy, reason || 'Effective period updated', {
      effectiveFrom: previousFrom.toISOString(),
      effectiveUntil: previousUntil?.toISOString(),
    }, {
      effectiveFrom: this._effectiveFrom.toISOString(),
      effectiveUntil: this._effectiveUntil?.toISOString(),
    });
  }

  /**
   * Suspende o acordo
   */
  suspend(changedBy: string, reason?: string): void {
    if (this._status !== AgreementStatus.ACTIVE) {
      throw new Error('Only active agreements can be suspended');
    }

    this._status = AgreementStatus.SUSPENDED;
    this._updatedAt = new Date();

    this.addHistoryEntry('suspended', this._updatedAt, changedBy, reason || 'Agreement suspended');
  }

  /**
   * Resume o acordo suspenso
   */
  resume(changedBy: string, reason?: string): void {
    if (this._status !== AgreementStatus.SUSPENDED) {
      throw new Error('Only suspended agreements can be resumed');
    }

    this._status = AgreementStatus.ACTIVE;
    this._updatedAt = new Date();

    this.addHistoryEntry('resumed', this._updatedAt, changedBy, reason || 'Agreement resumed');
  }

  /**
   * Termina o acordo
   */
  terminate(changedBy: string, reason?: string): void {
    if (this._status === AgreementStatus.TERMINATED) {
      throw new Error('Agreement is already terminated');
    }

    this._status = AgreementStatus.TERMINATED;
    this._effectiveUntil = new Date();
    this._updatedAt = new Date();

    this.addHistoryEntry('terminated', this._updatedAt, changedBy, reason || 'Agreement terminated');
  }

  /**
   * Atualiza configurações de alerta
   */
  updateAlerts(newAlerts: Partial<AgreementAlerts>, changedBy: string, reason?: string): void {
    const previousAlerts = { ...this._alerts };
    this._alerts = { ...this._alerts, ...newAlerts };
    this._updatedAt = new Date();

    this.addHistoryEntry('updated', this._updatedAt, changedBy, reason || 'Alerts updated', {
      alerts: previousAlerts,
    }, {
      alerts: this._alerts,
    });
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
   * Verifica se o acordo deve gerar alerta baseado no desvio
   */
  shouldAlert(actualSplit: Record<string, Money>, expectedSplit: Record<string, Money>): boolean {
    if (!this._alerts.enabled) {
      return false;
    }

    for (const [partnerId, expectedAmount] of Object.entries(expectedSplit)) {
      const actualAmount = actualSplit[partnerId];
      if (!actualAmount) {
        continue;
      }

      if (expectedAmount.isZero()) {
        continue;
      }

      const deviationPercentage = Math.abs(
        ((actualAmount.amount - expectedAmount.amount) / expectedAmount.amount) * 100
      );

      if (deviationPercentage > this._alerts.thresholdPercentage) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtém o histórico de alterações em um período
   */
  getHistoryInPeriod(startDate: Date, endDate: Date): AgreementHistory[] {
    return this._history.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Obtém as últimas N alterações
   */
  getRecentHistory(limit: number = 10): AgreementHistory[] {
    return this._history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Serializa o acordo para JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      householdId: this._householdId,
      type: this._type,
      name: this._name,
      description: this._description,
      splitRule: this._splitRule.toJSON(),
      status: this._status,
      effectiveFrom: this._effectiveFrom.toISOString(),
      effectiveUntil: this._effectiveUntil?.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      alerts: this._alerts,
      history: this._history.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      })),
      tags: this._tags,
      metadata: this._metadata,
      isActive: this.isActive(),
      isActiveOn: this.isActiveOn(new Date()),
    };
  }

  private addHistoryEntry(
    changeType: AgreementHistory['changeType'],
    timestamp: Date,
    changedBy: string,
    reason?: string,
    previousValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): void {
    const historyEntry: AgreementHistory = {
      id: uuidv4(),
      timestamp: new Date(timestamp),
      changedBy,
      changeType,
      previousValues,
      newValues,
      reason,
    };

    this._history.push(historyEntry);
  }
}
