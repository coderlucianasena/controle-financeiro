import { Money } from '../../../packages/domain/src/value-objects/Money';

describe('Money', () => {
  describe('constructor', () => {
    it('should create money with correct amount and currency', () => {
      const money = new Money(100.50, 'BRL');
      
      expect(money.amount).toBe(100.50);
      expect(money.currency).toBe('BRL');
      expect(money.amountInCents).toBe(10050);
    });

    it('should default to BRL currency when not specified', () => {
      const money = new Money(100);
      
      expect(money.currency).toBe('BRL');
      expect(money.amount).toBe(100);
    });

    it('should convert currency to uppercase', () => {
      const money = new Money(100, 'brl');
      
      expect(money.currency).toBe('BRL');
    });

    it('should throw error for invalid currency', () => {
      expect(() => new Money(100, 'INVALID')).toThrow('Currency must be a 3-letter code');
      expect(() => new Money(100, 'BR')).toThrow('Currency must be a 3-letter code');
    });

    it('should throw error for non-finite amount', () => {
      expect(() => new Money(NaN, 'BRL')).toThrow('Amount must be a finite number');
      expect(() => new Money(Infinity, 'BRL')).toThrow('Amount must be a finite number');
    });
  });

  describe('static methods', () => {
    it('should create money from cents', () => {
      const money = Money.fromCents(10050, 'BRL');
      
      expect(money.amount).toBe(100.50);
      expect(money.currency).toBe('BRL');
      expect(money.amountInCents).toBe(10050);
    });

    it('should create zero money', () => {
      const money = Money.zero('USD');
      
      expect(money.amount).toBe(0);
      expect(money.currency).toBe('USD');
      expect(money.amountInCents).toBe(0);
    });
  });

  describe('arithmetic operations', () => {
    let money1: Money;
    let money2: Money;

    beforeEach(() => {
      money1 = new Money(100, 'BRL');
      money2 = new Money(50, 'BRL');
    });

    it('should add two money amounts', () => {
      const result = money1.add(money2);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('BRL');
      expect(result.amountInCents).toBe(15000);
    });

    it('should subtract two money amounts', () => {
      const result = money1.subtract(money2);
      
      expect(result.amount).toBe(50);
      expect(result.currency).toBe('BRL');
      expect(result.amountInCents).toBe(5000);
    });

    it('should multiply money by factor', () => {
      const result = money1.multiply(2.5);
      
      expect(result.amount).toBe(250);
      expect(result.currency).toBe('BRL');
      expect(result.amountInCents).toBe(25000);
    });

    it('should divide money by divisor', () => {
      const result = money1.divide(2);
      
      expect(result.amount).toBe(50);
      expect(result.currency).toBe('BRL');
      expect(result.amountInCents).toBe(5000);
    });

    it('should throw error when adding different currencies', () => {
      const usdMoney = new Money(50, 'USD');
      
      expect(() => money1.add(usdMoney)).toThrow('Cannot perform operation with different currencies');
    });

    it('should throw error for invalid factor in multiply', () => {
      expect(() => money1.multiply(NaN)).toThrow('Factor must be a finite number');
    });

    it('should throw error for invalid divisor in divide', () => {
      expect(() => money1.divide(0)).toThrow('Divisor must be a non-zero finite number');
      expect(() => money1.divide(NaN)).toThrow('Divisor must be a non-zero finite number');
    });
  });

  describe('comparison methods', () => {
    let money1: Money;
    let money2: Money;
    let money3: Money;

    beforeEach(() => {
      money1 = new Money(100, 'BRL');
      money2 = new Money(50, 'BRL');
      money3 = new Money(100, 'BRL');
    });

    it('should compare money amounts correctly', () => {
      expect(money1.compareTo(money2)).toBe(50);
      expect(money2.compareTo(money1)).toBe(-50);
      expect(money1.compareTo(money3)).toBe(0);
    });

    it('should check if money is greater than', () => {
      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isGreaterThan(money1)).toBe(false);
      expect(money1.isGreaterThan(money3)).toBe(false);
    });

    it('should check if money is less than', () => {
      expect(money1.isLessThan(money2)).toBe(false);
      expect(money2.isLessThan(money1)).toBe(true);
      expect(money1.isLessThan(money3)).toBe(false);
    });

    it('should check if money is greater than or equal', () => {
      expect(money1.isGreaterThanOrEqual(money2)).toBe(true);
      expect(money2.isGreaterThanOrEqual(money1)).toBe(false);
      expect(money1.isGreaterThanOrEqual(money3)).toBe(true);
    });

    it('should check if money is less than or equal', () => {
      expect(money1.isLessThanOrEqual(money2)).toBe(false);
      expect(money2.isLessThanOrEqual(money1)).toBe(true);
      expect(money1.isLessThanOrEqual(money3)).toBe(true);
    });

    it('should throw error when comparing different currencies', () => {
      const usdMoney = new Money(100, 'USD');
      
      expect(() => money1.compareTo(usdMoney)).toThrow('Cannot perform operation with different currencies');
    });
  });

  describe('status checks', () => {
    it('should check if money is positive', () => {
      expect(new Money(100, 'BRL').isPositive()).toBe(true);
      expect(new Money(0, 'BRL').isPositive()).toBe(false);
      expect(new Money(-100, 'BRL').isPositive()).toBe(false);
    });

    it('should check if money is negative', () => {
      expect(new Money(100, 'BRL').isNegative()).toBe(false);
      expect(new Money(0, 'BRL').isNegative()).toBe(false);
      expect(new Money(-100, 'BRL').isNegative()).toBe(true);
    });

    it('should check if money is zero', () => {
      expect(new Money(100, 'BRL').isZero()).toBe(false);
      expect(new Money(0, 'BRL').isZero()).toBe(true);
      expect(new Money(-100, 'BRL').isZero()).toBe(false);
    });
  });

  describe('equality', () => {
    it('should check equality correctly', () => {
      const money1 = new Money(100.50, 'BRL');
      const money2 = new Money(100.50, 'BRL');
      const money3 = new Money(100.51, 'BRL');
      const money4 = new Money(100.50, 'USD');

      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
      expect(money1.equals(money4)).toBe(false);
    });
  });

  describe('formatting', () => {
    it('should format money correctly', () => {
      const money = new Money(1234.56, 'BRL');
      
      expect(money.format()).toBe('R$ 1.234,56');
      expect(money.format('en-US')).toBe('R$ 1,234.56');
    });

    it('should convert to JSON correctly', () => {
      const money = new Money(100.50, 'BRL');
      const json = money.toJSON();
      
      expect(json).toEqual({
        amount: 100.50,
        currency: 'BRL',
        amountInCents: 10050
      });
    });

    it('should convert to string correctly', () => {
      const money = new Money(100.50, 'BRL');
      
      expect(money.toString()).toBe('100.50 BRL');
    });
  });

  describe('precision handling', () => {
    it('should handle floating point precision correctly', () => {
      const money1 = new Money(0.1, 'BRL');
      const money2 = new Money(0.2, 'BRL');
      const result = money1.add(money2);
      
      expect(result.amount).toBe(0.3);
      expect(result.amountInCents).toBe(30);
    });

    it('should round to cents correctly', () => {
      const money = new Money(100.555, 'BRL');
      
      expect(money.amount).toBe(100.56);
      expect(money.amountInCents).toBe(10056);
    });
  });
});
