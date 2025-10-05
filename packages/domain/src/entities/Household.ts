import { v4 as uuidv4 } from 'uuid';
import { Partner } from './Partner';
import { Agreement } from './Agreement';
import { Goal } from './Goal';
import { Money } from '../value-objects/Money';

/**
 * Níveis de privacidade do household
 */
export enum PrivacyLevel {
  PRIVATE = 'private', // Apenas parceiros veem
  SHARED = 'shared', // Parceiros podem compartilhar com terceiros
  PUBLIC = 'public', // Visível publicamente (não recomendado para finanças)
}

/**
 * Configurações do household
 */
export interface HouseholdSettings {
  currency: string;
  privacyLevel: PrivacyLevel;
  allowRetroactiveChanges: boolean;
  requireApprovalForLargeTransactions: boolean;
  largeTransactionThreshold?: Money;
  monthlyReviewReminder: boolean;
  budgetAlerts: boolean;
  goalAlerts: boolean;
}

/**
 * Entidade Household - Representa o casal e suas configurações financeiras
 */
export class Household {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _name: string;
  private _partners: Partner[];
  private _agreements: Agreement[];
  private _goals: Goal[];
  private _settings: HouseholdSettings;

  constructor(
    name: string,
    settings: Partial<HouseholdSettings> = {},
    id?: string
  ) {
    this._id = id || uuidv4();
    this._name = name;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._partners = [];
    this._agreements = [];
    this._goals = [];
    
    this._settings = {
      currency: 'BRL',
      privacyLevel: PrivacyLevel.PRIVATE,
      allowRetroactiveChanges: false,
      requireApprovalForLargeTransactions: false,
      monthlyReviewReminder: true,
      budgetAlerts: true,
      goalAlerts: true,
      ...settings,
    };
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get partners(): Partner[] {
    return [...this._partners];
  }

  get agreements(): Agreement[] {
    return [...this._agreements];
  }

  get goals(): Goal[] {
    return [...this._goals];
  }

  get settings(): HouseholdSettings {
    return { ...this._settings };
  }

  get currency(): string {
    return this._settings.currency;
  }

  get privacyLevel(): PrivacyLevel {
    return this._settings.privacyLevel;
  }

  /**
   * Adiciona um parceiro ao household
   */
  addPartner(partner: Partner): void {
    if (this._partners.length >= 2) {
      throw new Error('Household can have maximum 2 partners');
    }

    if (this._partners.some(p => p.id === partner.id)) {
      throw new Error('Partner already exists in household');
    }

    this._partners.push(partner);
    this._updatedAt = new Date();
  }

  /**
   * Remove um parceiro do household
   */
  removePartner(partnerId: string): void {
    const index = this._partners.findIndex(p => p.id === partnerId);
    if (index === -1) {
      throw new Error('Partner not found in household');
    }

    this._partners.splice(index, 1);
    this._updatedAt = new Date();
  }

  /**
   * Obtém um parceiro por ID
   */
  getPartner(partnerId: string): Partner | undefined {
    return this._partners.find(p => p.id === partnerId);
  }

  /**
   * Adiciona um acordo financeiro
   */
  addAgreement(agreement: Agreement): void {
    // Verificar se já existe um acordo ativo do mesmo tipo
    const existingAgreement = this._agreements.find(
      a => a.type === agreement.type && a.isActive()
    );

    if (existingAgreement) {
      throw new Error(`Active agreement of type ${agreement.type} already exists`);
    }

    this._agreements.push(agreement);
    this._updatedAt = new Date();
  }

  /**
   * Remove um acordo financeiro
   */
  removeAgreement(agreementId: string): void {
    const index = this._agreements.findIndex(a => a.id === agreementId);
    if (index === -1) {
      throw new Error('Agreement not found');
    }

    this._agreements.splice(index, 1);
    this._updatedAt = new Date();
  }

  /**
   * Obtém acordos ativos em uma data específica
   */
  getActiveAgreements(date: Date = new Date()): Agreement[] {
    return this._agreements.filter(a => a.isActiveOn(date));
  }

  /**
   * Adiciona uma meta financeira
   */
  addGoal(goal: Goal): void {
    this._goals.push(goal);
    this._updatedAt = new Date();
  }

  /**
   * Remove uma meta financeira
   */
  removeGoal(goalId: string): void {
    const index = this._goals.findIndex(g => g.id === goalId);
    if (index === -1) {
      throw new Error('Goal not found');
    }

    this._goals.splice(index, 1);
    this._updatedAt = new Date();
  }

  /**
   * Obtém uma meta por ID
   */
  getGoal(goalId: string): Goal | undefined {
    return this._goals.find(g => g.id === goalId);
  }

  /**
   * Obtém metas ativas
   */
  getActiveGoals(): Goal[] {
    return this._goals.filter(g => g.isActive());
  }

  /**
   * Atualiza as configurações do household
   */
  updateSettings(newSettings: Partial<HouseholdSettings>): void {
    this._settings = { ...this._settings, ...newSettings };
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o nome do household
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Household name cannot be empty');
    }

    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  /**
   * Verifica se o household está completo (tem 2 parceiros)
   */
  isComplete(): boolean {
    return this._partners.length === 2;
  }

  /**
   * Verifica se o household está vazio (sem parceiros)
   */
  isEmpty(): boolean {
    return this._partners.length === 0;
  }

  /**
   * Obtém o total de renda dos parceiros
   */
  getTotalIncome(): Money {
    return this._partners.reduce(
      (total, partner) => total.add(partner.getTotalIncome()),
      Money.zero(this._settings.currency)
    );
  }

  /**
   * Obtém a renda de um parceiro específico
   */
  getPartnerIncome(partnerId: string): Money {
    const partner = this.getPartner(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }
    return partner.getTotalIncome();
  }

  /**
   * Obtém a porcentagem de renda de um parceiro
   */
  getPartnerIncomePercentage(partnerId: string): number {
    const totalIncome = this.getTotalIncome();
    if (totalIncome.isZero()) {
      return 0;
    }

    const partnerIncome = this.getPartnerIncome(partnerId);
    return (partnerIncome.amount / totalIncome.amount) * 100;
  }

  /**
   * Verifica se uma transação requer aprovação baseada nas configurações
   */
  requiresApproval(amount: Money): boolean {
    if (!this._settings.requireApprovalForLargeTransactions) {
      return false;
    }

    if (!this._settings.largeTransactionThreshold) {
      return false;
    }

    return amount.isGreaterThan(this._settings.largeTransactionThreshold);
  }

  /**
   * Serializa o household para JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      name: this._name,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      partners: this._partners.map(p => p.toJSON()),
      agreements: this._agreements.map(a => a.toJSON()),
      goals: this._goals.map(g => g.toJSON()),
      settings: this._settings,
      isComplete: this.isComplete(),
      isEmpty: this.isEmpty(),
    };
  }
}
