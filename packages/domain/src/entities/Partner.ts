import { v4 as uuidv4 } from 'uuid';
import { Money } from '../value-objects/Money';

/**
 * Pronomes suportados
 */
export enum Pronoun {
  ELE = 'ele',
  ELA = 'ela',
  ELU = 'elu',
  OUTRO = 'outro',
}

/**
 * Stream de renda do parceiro
 */
export interface IncomeStream {
  id: string;
  name: string;
  amount: Money;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'yearly';
  isActive: boolean;
  notes?: string;
}

/**
 * Preferências de notificação
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  budgetAlerts: boolean;
  goalAlerts: boolean;
  agreementAlerts: boolean;
  monthlyReview: boolean;
}

/**
 * Configurações de avatar
 */
export interface AvatarSettings {
  type: 'emoji' | 'image' | 'initials';
  value: string; // emoji, URL da imagem ou iniciais
  backgroundColor?: string;
}

/**
 * Entidade Partner - Representa um parceiro no sistema
 */
export class Partner {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _name: string;
  private _email: string;
  private _pronouns: Pronoun[];
  private _incomeStreams: IncomeStream[];
  private _notificationPreferences: NotificationPreferences;
  private _avatar: AvatarSettings;
  private _isActive: boolean;

  constructor(
    name: string,
    email: string,
    pronouns: Pronoun[] = [Pronoun.OUTRO],
    id?: string
  ) {
    this._id = id || uuidv4();
    this._name = name;
    this._email = email;
    this._pronouns = [...pronouns];
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._incomeStreams = [];
    this._isActive = true;

    // Configurações padrão
    this._notificationPreferences = {
      email: true,
      push: true,
      budgetAlerts: true,
      goalAlerts: true,
      agreementAlerts: true,
      monthlyReview: true,
    };

    this._avatar = {
      type: 'initials',
      value: this.generateInitials(name),
    };
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get pronouns(): Pronoun[] {
    return [...this._pronouns];
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get incomeStreams(): IncomeStream[] {
    return [...this._incomeStreams];
  }

  get notificationPreferences(): NotificationPreferences {
    return { ...this._notificationPreferences };
  }

  get avatar(): AvatarSettings {
    return { ...this._avatar };
  }

  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Atualiza o nome do parceiro
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Partner name cannot be empty');
    }

    this._name = newName.trim();
    this._avatar.value = this.generateInitials(this._name);
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o email do parceiro
   */
  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }

    this._email = newEmail.toLowerCase();
    this._updatedAt = new Date();
  }

  /**
   * Atualiza os pronomes do parceiro
   */
  updatePronouns(newPronouns: Pronoun[]): void {
    if (!newPronouns || newPronouns.length === 0) {
      throw new Error('At least one pronoun must be specified');
    }

    this._pronouns = [...newPronouns];
    this._updatedAt = new Date();
  }

  /**
   * Adiciona um stream de renda
   */
  addIncomeStream(incomeStream: IncomeStream): void {
    if (this._incomeStreams.some(stream => stream.id === incomeStream.id)) {
      throw new Error('Income stream with this ID already exists');
    }

    this._incomeStreams.push(incomeStream);
    this._updatedAt = new Date();
  }

  /**
   * Remove um stream de renda
   */
  removeIncomeStream(streamId: string): void {
    const index = this._incomeStreams.findIndex(stream => stream.id === streamId);
    if (index === -1) {
      throw new Error('Income stream not found');
    }

    this._incomeStreams.splice(index, 1);
    this._updatedAt = new Date();
  }

  /**
   * Atualiza um stream de renda
   */
  updateIncomeStream(streamId: string, updates: Partial<IncomeStream>): void {
    const stream = this._incomeStreams.find(s => s.id === streamId);
    if (!stream) {
      throw new Error('Income stream not found');
    }

    Object.assign(stream, updates);
    this._updatedAt = new Date();
  }

  /**
   * Obtém streams de renda ativos
   */
  getActiveIncomeStreams(): IncomeStream[] {
    return this._incomeStreams.filter(stream => stream.isActive);
  }

  /**
   * Calcula a renda total mensal
   */
  getTotalIncome(currency: string = 'BRL'): Money {
    const activeStreams = this.getActiveIncomeStreams();
    let totalMonthly = Money.zero(currency);

    for (const stream of activeStreams) {
      if (stream.amount.currency !== currency) {
        // TODO: Implementar conversão de moeda
        continue;
      }

      let monthlyAmount = stream.amount;

      switch (stream.frequency) {
        case 'weekly':
          monthlyAmount = stream.amount.multiply(52).divide(12);
          break;
        case 'biweekly':
          monthlyAmount = stream.amount.multiply(26).divide(12);
          break;
        case 'yearly':
          monthlyAmount = stream.amount.divide(12);
          break;
        case 'monthly':
        default:
          // Já está em valor mensal
          break;
      }

      totalMonthly = totalMonthly.add(monthlyAmount);
    }

    return totalMonthly;
  }

  /**
   * Atualiza as preferências de notificação
   */
  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
    this._notificationPreferences = { ...this._notificationPreferences, ...preferences };
    this._updatedAt = new Date();
  }

  /**
   * Atualiza as configurações de avatar
   */
  updateAvatar(avatar: Partial<AvatarSettings>): void {
    this._avatar = { ...this._avatar, ...avatar };
    this._updatedAt = new Date();
  }

  /**
   * Ativa o parceiro
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Desativa o parceiro
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Formata os pronomes para exibição
   */
  formatPronouns(): string {
    if (this._pronouns.length === 0) {
      return '';
    }

    if (this._pronouns.length === 1) {
      return this._pronouns[0];
    }

    if (this._pronouns.length === 2) {
      return `${this._pronouns[0]}/${this._pronouns[1]}`;
    }

    return this._pronouns.slice(0, -1).join(', ') + ` e ${this._pronouns[this._pronouns.length - 1]}`;
  }

  /**
   * Obtém o nome formatado com pronomes
   */
  getDisplayName(): string {
    const pronouns = this.formatPronouns();
    return pronouns ? `${this._name} (${pronouns})` : this._name;
  }

  /**
   * Verifica se o parceiro tem notificações habilitadas para um tipo específico
   */
  hasNotificationEnabled(type: keyof NotificationPreferences): boolean {
    return this._notificationPreferences[type];
  }

  /**
   * Serializa o parceiro para JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      pronouns: this._pronouns,
      displayName: this.getDisplayName(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      incomeStreams: this._incomeStreams,
      notificationPreferences: this._notificationPreferences,
      avatar: this._avatar,
      isActive: this._isActive,
      totalMonthlyIncome: this.getTotalIncome().toJSON(),
    };
  }

  private generateInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 0) {
      return '?';
    }

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
