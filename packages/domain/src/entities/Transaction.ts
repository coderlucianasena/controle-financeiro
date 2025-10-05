import { v4 as uuidv4 } from 'uuid';
import { Money } from '../value-objects/Money';
import { SplitRule, SplitResult } from '../value-objects/SplitRule';

/**
 * Tipos de transação
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

/**
 * Status da transação
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

/**
 * Detalhes de divisão da transação
 */
export interface TransactionSplit {
  partnerId: string;
  amount: Money;
  percentage: number;
  isPaid: boolean;
  paidAt?: Date;
  notes?: string;
}

/**
 * Categoria da transação
 */
export interface TransactionCategory {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

/**
 * Entidade Transaction - Representa uma transação financeira
 */
export class Transaction {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _accountId: string;
  private _amount: Money;
  private _type: TransactionType;
  private _status: TransactionStatus;
  private _description: string;
  private _occurredAt: Date;
  private _category?: TransactionCategory;
  private _tags: string[];
  private _splitDetails: TransactionSplit[];
  private _notes?: string;
  private _externalId?: string; // ID da transação no sistema externo
  private _metadata?: Record<string, any>;

  constructor(
    accountId: string,
    amount: Money,
    type: TransactionType,
    description: string,
    occurredAt: Date = new Date(),
    id?: string
  ) {
    this._id = id || uuidv4();
    this._accountId = accountId;
    this._amount = amount;
    this._type = type;
    this._status = TransactionStatus.PENDING;
    this._description = description;
    this._occurredAt = new Date(occurredAt);
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._tags = [];
    this._splitDetails = [];
  }

  get id(): string {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
  }

  get amount(): Money {
    return this._amount;
  }

  get type(): TransactionType {
    return this._type;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get description(): string {
    return this._description;
  }

  get occurredAt(): Date {
    return new Date(this._occurredAt);
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get category(): TransactionCategory | undefined {
    return this._category;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get splitDetails(): TransactionSplit[] {
    return [...this._splitDetails];
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get externalId(): string | undefined {
    return this._externalId;
  }

  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Atualiza o valor da transação
   */
  updateAmount(newAmount: Money): void {
    if (this._status === TransactionStatus.CONFIRMED) {
      throw new Error('Cannot update amount of confirmed transaction');
    }

    this._amount = newAmount;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a descrição
   */
  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new Error('Transaction description cannot be empty');
    }

    this._description = newDescription.trim();
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a data de ocorrência
   */
  updateOccurredAt(newDate: Date): void {
    this._occurredAt = new Date(newDate);
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o status da transação
   */
  updateStatus(newStatus: TransactionStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  /**
   * Confirma a transação
   */
  confirm(): void {
    this._status = TransactionStatus.CONFIRMED;
    this._updatedAt = new Date();
  }

  /**
   * Cancela a transação
   */
  cancel(): void {
    this._status = TransactionStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  /**
   * Marca como disputada
   */
  dispute(): void {
    this._status = TransactionStatus.DISPUTED;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a categoria
   */
  updateCategory(category?: TransactionCategory): void {
    this._category = category;
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
   * Atualiza as tags
   */
  updateTags(tags: string[]): void {
    this._tags = tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    this._updatedAt = new Date();
  }

  /**
   * Aplica divisão da transação
   */
  applySplit(splitRule: SplitRule, partnerIncomes?: Map<string, Money>): void {
    const splitResults = splitRule.split(this._amount, partnerIncomes);
    
    this._splitDetails = splitResults.map(result => ({
      partnerId: result.partnerId,
      amount: result.amount,
      percentage: result.percentage,
      isPaid: false,
    }));

    this._updatedAt = new Date();
  }

  /**
   * Atualiza detalhes de divisão manualmente
   */
  updateSplitDetails(splitDetails: TransactionSplit[]): void {
    // Validar se a soma das divisões é igual ao valor total
    const totalSplit = splitDetails.reduce(
      (sum, detail) => sum.add(detail.amount),
      Money.zero(this._amount.currency)
    );

    if (!totalSplit.equals(this._amount)) {
      throw new Error('Split details sum must equal transaction amount');
    }

    this._splitDetails = [...splitDetails];
    this._updatedAt = new Date();
  }

  /**
   * Marca uma divisão como paga
   */
  markSplitAsPaid(partnerId: string, paidAt: Date = new Date()): void {
    const split = this._splitDetails.find(detail => detail.partnerId === partnerId);
    if (!split) {
      throw new Error('Split detail not found for partner');
    }

    split.isPaid = true;
    split.paidAt = new Date(paidAt);
    this._updatedAt = new Date();
  }

  /**
   * Marca uma divisão como não paga
   */
  markSplitAsUnpaid(partnerId: string): void {
    const split = this._splitDetails.find(detail => detail.partnerId === partnerId);
    if (!split) {
      throw new Error('Split detail not found for partner');
    }

    split.isPaid = false;
    split.paidAt = undefined;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza as notas
   */
  updateNotes(notes?: string): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  /**
   * Define o ID externo
   */
  setExternalId(externalId: string): void {
    this._externalId = externalId;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza metadados
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...metadata };
    this._updatedAt = new Date();
  }

  /**
   * Verifica se a transação está confirmada
   */
  isConfirmed(): boolean {
    return this._status === TransactionStatus.CONFIRMED;
  }

  /**
   * Verifica se a transação está pendente
   */
  isPending(): boolean {
    return this._status === TransactionStatus.PENDING;
  }

  /**
   * Verifica se a transação foi cancelada
   */
  isCancelled(): boolean {
    return this._status === TransactionStatus.CANCELLED;
  }

  /**
   * Verifica se a transação está em disputa
   */
  isDisputed(): boolean {
    return this._status === TransactionStatus.DISPUTED;
  }

  /**
   * Verifica se é uma transação de receita
   */
  isIncome(): boolean {
    return this._type === TransactionType.INCOME;
  }

  /**
   * Verifica se é uma transação de despesa
   */
  isExpense(): boolean {
    return this._type === TransactionType.EXPENSE;
  }

  /**
   * Verifica se é uma transferência
   */
  isTransfer(): boolean {
    return this._type === TransactionType.TRANSFER;
  }

  /**
   * Verifica se é um ajuste
   */
  isAdjustment(): boolean {
    return this._type === TransactionType.ADJUSTMENT;
  }

  /**
   * Obtém o valor absoluto da transação
   */
  getAbsoluteAmount(): Money {
    return this._amount.isNegative() ? this._amount.multiply(-1) : this._amount;
  }

  /**
   * Verifica se todas as divisões foram pagas
   */
  areAllSplitsPaid(): boolean {
    return this._splitDetails.length > 0 && this._splitDetails.every(split => split.isPaid);
  }

  /**
   * Obtém o total de divisões pagas
   */
  getPaidSplitsTotal(): Money {
    return this._splitDetails
      .filter(split => split.isPaid)
      .reduce((sum, split) => sum.add(split.amount), Money.zero(this._amount.currency));
  }

  /**
   * Obtém o total de divisões não pagas
   */
  getUnpaidSplitsTotal(): Money {
    return this._splitDetails
      .filter(split => !split.isPaid)
      .reduce((sum, split) => sum.add(split.amount), Money.zero(this._amount.currency));
  }

  /**
   * Serializa a transação para JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      accountId: this._accountId,
      amount: this._amount.toJSON(),
      type: this._type,
      status: this._status,
      description: this._description,
      occurredAt: this._occurredAt.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      category: this._category,
      tags: this._tags,
      splitDetails: this._splitDetails.map(split => ({
        ...split,
        amount: split.amount.toJSON(),
        paidAt: split.paidAt?.toISOString(),
      })),
      notes: this._notes,
      externalId: this._externalId,
      metadata: this._metadata,
      isConfirmed: this.isConfirmed(),
      isPending: this.isPending(),
      isCancelled: this.isCancelled(),
      isDisputed: this.isDisputed(),
      isIncome: this.isIncome(),
      isExpense: this.isExpense(),
      isTransfer: this.isTransfer(),
      isAdjustment: this.isAdjustment(),
      absoluteAmount: this.getAbsoluteAmount().toJSON(),
      areAllSplitsPaid: this.areAllSplitsPaid(),
      paidSplitsTotal: this.getPaidSplitsTotal().toJSON(),
      unpaidSplitsTotal: this.getUnpaidSplitsTotal().toJSON(),
    };
  }
}
