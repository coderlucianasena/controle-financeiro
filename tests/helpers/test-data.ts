import { v4 as uuidv4 } from 'uuid';
import { PrivacyLevel } from '../../packages/domain/src/entities/Household';
import { Pronoun } from '../../packages/domain/src/entities/Partner';
import { TransactionType } from '../../packages/domain/src/entities/Transaction';
import { AgreementType } from '../../packages/domain/src/entities/Agreement';
import { EnvelopeType } from '../../packages/domain/src/entities/BudgetEnvelope';
import { GoalType } from '../../packages/domain/src/entities/Goal';
import { Money } from '../../packages/domain/src/value-objects/Money';

/**
 * Cria dados de teste para um household
 */
export const createTestHousehold = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  name: 'Test Household',
  currency: 'BRL',
  privacyLevel: PrivacyLevel.PRIVATE,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Cria dados de teste para um parceiro
 */
export const createTestPartner = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  name: 'Test Partner',
  email: 'test@example.com',
  pronouns: [Pronoun.OUTRO],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  isActive: true,
  ...overrides,
});

/**
 * Cria dados de teste para uma transação
 */
export const createTestTransaction = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  accountId: uuidv4(),
  amount: new Money(100, 'BRL'),
  type: TransactionType.EXPENSE,
  description: 'Test transaction',
  occurredAt: new Date('2024-01-01T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Cria dados de teste para um acordo
 */
export const createTestAgreement = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  householdId: uuidv4(),
  type: AgreementType.FIXED_EXPENSES,
  name: 'Test Agreement',
  description: 'Test agreement description',
  effectiveFrom: new Date('2024-01-01T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Cria dados de teste para um envelope de orçamento
 */
export const createTestBudgetEnvelope = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  householdId: uuidv4(),
  name: 'Test Envelope',
  type: EnvelopeType.SHARED,
  limit: new Money(1000, 'BRL'),
  spent: new Money(0, 'BRL'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  isActive: true,
  ...overrides,
});

/**
 * Cria dados de teste para uma meta
 */
export const createTestGoal = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  householdId: uuidv4(),
  name: 'Test Goal',
  type: GoalType.TRAVEL,
  targetAmount: new Money(10000, 'BRL'),
  currentAmount: new Money(0, 'BRL'),
  targetDate: new Date('2024-12-31T00:00:00Z'),
  ownerIds: [uuidv4()],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Cria dados de teste para uma conta
 */
export const createTestAccount = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  name: 'Test Account',
  type: 'checking',
  currency: 'BRL',
  balance: new Money(1000, 'BRL'),
  ownerId: uuidv4(),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  isActive: true,
  ...overrides,
});

/**
 * Cria dados de teste para um stream de renda
 */
export const createTestIncomeStream = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  name: 'Salary',
  amount: new Money(5000, 'BRL'),
  frequency: 'monthly',
  isActive: true,
  ...overrides,
});

/**
 * Cria dados de teste para uma categoria de transação
 */
export const createTestCategory = (overrides?: Partial<any>) => ({
  id: uuidv4(),
  name: 'Test Category',
  parentId: undefined,
  color: '#3B82F6',
  icon: '🏷️',
  ...overrides,
});

/**
 * Cria dados de teste para um split de transação
 */
export const createTestTransactionSplit = (overrides?: Partial<any>) => ({
  partnerId: uuidv4(),
  amount: new Money(50, 'BRL'),
  percentage: 50,
  isPaid: false,
  notes: 'Test split',
  ...overrides,
});

/**
 * Fixtures completos para testes
 */
export const fixtures = {
  households: {
    complete: createTestHousehold({
      name: 'Complete Household',
      partners: [
        createTestPartner({ name: 'Alex', email: 'alex@example.com' }),
        createTestPartner({ name: 'Sam', email: 'sam@example.com' }),
      ],
    }),
    minimal: createTestHousehold({
      name: 'Minimal Household',
      partners: [],
    }),
  },
  
  partners: {
    alex: createTestPartner({
      name: 'Alex',
      email: 'alex@example.com',
      pronouns: [Pronoun.ELE],
    }),
    sam: createTestPartner({
      name: 'Sam',
      email: 'sam@example.com',
      pronouns: [Pronoun.ELA],
    }),
    lu: createTestPartner({
      name: 'Lu',
      email: 'lu@example.com',
      pronouns: [Pronoun.ELU],
    }),
  },
  
  transactions: {
    expense: createTestTransaction({
      type: TransactionType.EXPENSE,
      amount: new Money(100, 'BRL'),
      description: 'Grocery shopping',
    }),
    income: createTestTransaction({
      type: TransactionType.INCOME,
      amount: new Money(5000, 'BRL'),
      description: 'Salary',
    }),
    transfer: createTestTransaction({
      type: TransactionType.TRANSFER,
      amount: new Money(500, 'BRL'),
      description: 'Transfer to savings',
    }),
  },
  
  agreements: {
    fixedExpenses: createTestAgreement({
      type: AgreementType.FIXED_EXPENSES,
      name: 'Fixed Expenses Agreement',
      description: 'Agreement for fixed household expenses',
    }),
    variableExpenses: createTestAgreement({
      type: AgreementType.VARIABLE_EXPENSES,
      name: 'Variable Expenses Agreement',
      description: 'Agreement for variable household expenses',
    }),
  },
  
  goals: {
    travel: createTestGoal({
      type: GoalType.TRAVEL,
      name: 'Europe Trip',
      targetAmount: new Money(15000, 'BRL'),
      targetDate: new Date('2024-12-31T00:00:00Z'),
    }),
    emergency: createTestGoal({
      type: GoalType.EMERGENCY_FUND,
      name: 'Emergency Fund',
      targetAmount: new Money(10000, 'BRL'),
      targetDate: new Date('2024-06-30T00:00:00Z'),
    }),
  },
  
  accounts: {
    checking: createTestAccount({
      name: 'Main Checking Account',
      type: 'checking',
      balance: new Money(5000, 'BRL'),
    }),
    savings: createTestAccount({
      name: 'Savings Account',
      type: 'savings',
      balance: new Money(10000, 'BRL'),
    }),
    credit: createTestAccount({
      name: 'Credit Card',
      type: 'credit',
      balance: new Money(0, 'BRL'),
    }),
  },
};

/**
 * Utilitários para criação de dados de teste
 */
export const testUtils = {
  /**
   * Cria um array de dados de teste
   */
  createArray: <T>(factory: () => T, count: number): T[] => {
    return Array.from({ length: count }, factory);
  },
  
  /**
   * Cria dados de teste com IDs relacionados
   */
  createRelatedData: (householdId: string, partnerIds: string[]) => ({
    household: createTestHousehold({ id: householdId }),
    partners: partnerIds.map(id => createTestPartner({ id })),
    accounts: partnerIds.map(id => createTestAccount({ ownerId: id })),
  }),
  
  /**
   * Cria uma transação com splits
   */
  createTransactionWithSplits: (
    amount: Money,
    partnerIds: string[],
    overrides?: Partial<any>
  ) => {
    const splits = partnerIds.map(partnerId => 
      createTestTransactionSplit({
        partnerId,
        amount: amount.divide(partnerIds.length),
        percentage: 100 / partnerIds.length,
      })
    );
    
    return createTestTransaction({
      amount,
      splitDetails: splits,
      ...overrides,
    });
  },
};
