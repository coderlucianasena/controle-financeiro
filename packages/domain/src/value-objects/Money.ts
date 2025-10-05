/**
 * Value Object para representar valores monetários com precisão decimal
 * Evita problemas de ponto flutuante usando centavos como unidade base
 */
export class Money {
  private readonly _amountInCents: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = 'BRL') {
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code (ISO 4217)');
    }

    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number');
    }

    // Converte para centavos para evitar problemas de precisão
    this._amountInCents = Math.round(amount * 100);
    this._currency = currency.toUpperCase();
  }

  static fromCents(amountInCents: number, currency: string = 'BRL'): Money {
    return new Money(amountInCents / 100, currency);
  }

  static zero(currency: string = 'BRL'): Money {
    return new Money(0, currency);
  }

  get amount(): number {
    return this._amountInCents / 100;
  }

  get amountInCents(): number {
    return this._amountInCents;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(
      (this._amountInCents + other._amountInCents) / 100,
      this._currency
    );
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(
      (this._amountInCents - other._amountInCents) / 100,
      this._currency
    );
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new Error('Factor must be a finite number');
    }
    return new Money((this._amountInCents * factor) / 100, this._currency);
  }

  divide(divisor: number): Money {
    if (!Number.isFinite(divisor) || divisor === 0) {
      throw new Error('Divisor must be a non-zero finite number');
    }
    return new Money(this._amountInCents / (divisor * 100), this._currency);
  }

  isPositive(): boolean {
    return this._amountInCents > 0;
  }

  isNegative(): boolean {
    return this._amountInCents < 0;
  }

  isZero(): boolean {
    return this._amountInCents === 0;
  }

  equals(other: Money): boolean {
    return (
      this._amountInCents === other._amountInCents &&
      this._currency === other._currency
    );
  }

  compareTo(other: Money): number {
    this.ensureSameCurrency(other);
    return this._amountInCents - other._amountInCents;
  }

  isGreaterThan(other: Money): boolean {
    return this.compareTo(other) > 0;
  }

  isLessThan(other: Money): boolean {
    return this.compareTo(other) < 0;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.compareTo(other) >= 0;
  }

  isLessThanOrEqual(other: Money): boolean {
    return this.compareTo(other) <= 0;
  }

  format(locale: string = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this.amount);
  }

  toJSON(): { amount: number; currency: string; amountInCents: number } {
    return {
      amount: this.amount,
      currency: this._currency,
      amountInCents: this._amountInCents,
    };
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this._currency}`;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot perform operation with different currencies: ${this._currency} and ${other._currency}`
      );
    }
  }
}
