import { v4 as uuidv4 } from 'uuid';
import { Money } from '../value-objects/Money';

/**
 * Tipos de provedores de conta
 */
export enum AccountProvider {
  MANUAL = 'manual',
  BANK = 'bank',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  SAVINGS = 'savings',
  CASH = 'cash',
}

/**
 * Tipos de conta
 */
export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  INVESTMENT = 'investment',
  CASH = 'cash',
}

/**
 * Configurações de integração
 */
export interface IntegrationSettings {
  provider: AccountProvider;
  externalId?: string;
  syncEnabled: boolean;
  lastSyncAt?: Date;
  credentials?: Record<string, any>; // Dados criptografados
}

/**
 * Entidade Account - Representa uma conta financeira
 */
export class Account {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _name: string;
  private _type: AccountType;
  private _currency: string;
  private _balance: Money;
  private _ownerId?: string; // null = conta conjunta
  private _integration: IntegrationSettings;
  private _isActive: boolean;
  private _description?: string;
  private _color?: string; // Para UI
  private _icon?: string; // Para UI

  constructor(
    name: string,
    type: AccountType,
    currency: string = 'BRL',
    ownerId?: string,
    integration?: Partial<IntegrationSettings>,
    id?: string
  ) {
    this._id = id || uuidv4();
    this._name = name;
    this._type = type;
    this._currency = currency;
    this._balance = Money.zero(currency);
    this._ownerId = ownerId;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._isActive = true;

    this._integration = {
      provider: AccountProvider.MANUAL,
      syncEnabled: false,
      ...integration,
    };
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get type(): AccountType {
    return this._type;
  }

  get currency(): string {
    return this._currency;
  }

  get balance(): Money {
    return this._balance;
  }

  get ownerId(): string | undefined {
    return this._ownerId;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get integration(): IntegrationSettings {
    return { ...this._integration };
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get description(): string | undefined {
    return this._description;
  }

  get color(): string | undefined {
    return this._color;
  }

  get icon(): string | undefined {
    return this._icon;
  }

  /**
   * Verifica se é uma conta conjunta
   */
  isShared(): boolean {
    return this._ownerId === undefined;
  }

  /**
   * Verifica se é uma conta individual
   */
  isIndividual(): boolean {
    return this._ownerId !== undefined;
  }

  /**
   * Verifica se a conta pertence a um parceiro específico
   */
  belongsTo(partnerId: string): boolean {
    return this._ownerId === partnerId;
  }

  /**
   * Atualiza o nome da conta
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Account name cannot be empty');
    }

    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o tipo da conta
   */
  updateType(newType: AccountType): void {
    this._type = newType;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o saldo da conta
   */
  updateBalance(newBalance: Money): void {
    if (newBalance.currency !== this._currency) {
      throw new Error('Balance currency must match account currency');
    }

    this._balance = newBalance;
    this._updatedAt = new Date();
  }

  /**
   * Adiciona valor ao saldo
   */
  addToBalance(amount: Money): void {
    if (amount.currency !== this._currency) {
      throw new Error('Amount currency must match account currency');
    }

    this._balance = this._balance.add(amount);
    this._updatedAt = new Date();
  }

  /**
   * Subtrai valor do saldo
   */
  subtractFromBalance(amount: Money): void {
    if (amount.currency !== this._currency) {
      throw new Error('Amount currency must match account currency');
    }

    this._balance = this._balance.subtract(amount);
    this._updatedAt = new Date();
  }

  /**
   * Transfere valor para outra conta
   */
  transferTo(targetAccount: Account, amount: Money): void {
    if (amount.currency !== this._currency) {
      throw new Error('Amount currency must match account currency');
    }

    if (amount.isNegative() || amount.isZero()) {
      throw new Error('Transfer amount must be positive');
    }

    if (this._balance.isLessThan(amount)) {
      throw new Error('Insufficient balance for transfer');
    }

    // Converter moeda se necessário
    let targetAmount = amount;
    if (targetAccount.currency !== this._currency) {
      // TODO: Implementar conversão de moeda
      throw new Error('Currency conversion not implemented');
    }

    this.subtractFromBalance(amount);
    targetAccount.addToBalance(targetAmount);
  }

  /**
   * Atualiza as configurações de integração
   */
  updateIntegration(integration: Partial<IntegrationSettings>): void {
    this._integration = { ...this._integration, ...integration };
    this._updatedAt = new Date();
  }

  /**
   * Habilita sincronização
   */
  enableSync(): void {
    this._integration.syncEnabled = true;
    this._updatedAt = new Date();
  }

  /**
   * Desabilita sincronização
   */
  disableSync(): void {
    this._integration.syncEnabled = false;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a data da última sincronização
   */
  updateLastSync(): void {
    this._integration.lastSyncAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a descrição
   */
  updateDescription(description?: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza a cor da conta (para UI)
   */
  updateColor(color?: string): void {
    this._color = color;
    this._updatedAt = new Date();
  }

  /**
   * Atualiza o ícone da conta (para UI)
   */
  updateIcon(icon?: string): void {
    this._icon = icon;
    this._updatedAt = new Date();
  }

  /**
   * Ativa a conta
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Desativa a conta
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Verifica se é uma conta de crédito
   */
  isCreditAccount(): boolean {
    return this._type === AccountType.CREDIT;
  }

  /**
   * Verifica se é uma conta de débito
   */
  isDebitAccount(): boolean {
    return this._type !== AccountType.CREDIT;
  }

  /**
   * Obtém o saldo disponível (considerando limites de crédito)
   */
  getAvailableBalance(creditLimit?: Money): Money {
    if (this.isCreditAccount() && creditLimit) {
      return creditLimit.subtract(this._balance);
    }
    return this._balance;
  }

  /**
   * Verifica se há saldo suficiente para uma operação
   */
  hasSufficientBalance(amount: Money, creditLimit?: Money): boolean {
    const availableBalance = this.getAvailableBalance(creditLimit);
    return availableBalance.isGreaterThanOrEqual(amount);
  }

  /**
   * Serializa a conta para JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      currency: this._currency,
      balance: this._balance.toJSON(),
      ownerId: this._ownerId,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      integration: {
        ...this._integration,
        lastSyncAt: this._integration.lastSyncAt?.toISOString(),
      },
      isActive: this._isActive,
      description: this._description,
      color: this._color,
      icon: this._icon,
      isShared: this.isShared(),
      isIndividual: this.isIndividual(),
    };
  }
}
