# Testes do Sistema

Este diretório contém os testes automatizados do sistema de controle financeiro.

## 📁 Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── domain/             # Testes da camada de domínio
│   ├── application/        # Testes da camada de aplicação
│   └── shared/             # Testes de utilitários compartilhados
├── integration/            # Testes de integração
│   ├── api/               # Testes da API
│   ├── database/          # Testes de banco de dados
│   └── external/          # Testes de integrações externas
├── e2e/                   # Testes end-to-end
│   ├── onboarding/        # Fluxo de onboarding
│   ├── transactions/      # Fluxo de transações
│   ├── agreements/        # Fluxo de acordos
│   └── goals/             # Fluxo de metas
├── fixtures/              # Dados de teste
├── helpers/               # Utilitários para testes
└── setup/                 # Configuração de testes
```

## 🧪 Tipos de Testes

### 1. Testes Unitários

Testam componentes isolados:

- **Domain**: Entidades, value objects, regras de negócio
- **Application**: Casos de uso, serviços
- **Shared**: Utilitários, helpers

### 2. Testes de Integração

Testam a interação entre componentes:

- **API**: Endpoints, middlewares, controllers
- **Database**: Repositórios, migrações
- **External**: Integrações bancárias, notificações

### 3. Testes E2E

Testam fluxos completos do usuário:

- **Onboarding**: Criação de household e parceiros
- **Transactions**: Registro e divisão de transações
- **Agreements**: Criação e gestão de acordos
- **Goals**: Criação e acompanhamento de metas

## 🚀 Executando Testes

### Todos os Testes

```bash
# Na raiz do projeto
npm run test

# Com coverage
npm run test:coverage
```

### Testes por Tipo

```bash
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e
```

### Testes por Package

```bash
# Domain
cd packages/domain && npm run test

# Application
cd packages/application && npm run test

# Infrastructure
cd packages/infrastructure && npm run test

# Interfaces
cd packages/interfaces && npm run test
```

### Testes com Debug

```bash
# Debug de testes unitários
npm run test:debug

# Debug de testes de integração
npm run test:integration:debug

# Debug de testes E2E
npm run test:e2e:debug
```

## 📊 Coverage

### Configuração de Coverage

```json
{
  "collectCoverageFrom": [
    "packages/**/src/**/*.{ts,tsx}",
    "apps/**/src/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.test.{ts,tsx}",
    "!**/*.spec.{ts,tsx}",
    "!**/node_modules/**"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Relatórios de Coverage

```bash
# Gerar relatório HTML
npm run test:coverage:html

# Gerar relatório JSON
npm run test:coverage:json

# Gerar relatório LCOV
npm run test:coverage:lcov
```

## 🔧 Configuração de Testes

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/apps'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    'apps/**/src/**/*.ts',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
};
```

### Setup de Testes

```typescript
// tests/setup/jest.setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configurar timeout para testes
jest.setTimeout(10000);

// Configurar testing library
configure({ testIdAttribute: 'data-testid' });

// Mock de variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
```

## 📝 Escrevendo Testes

### Testes Unitários

```typescript
// tests/unit/domain/Money.test.ts
import { Money } from '../../../packages/domain/src/value-objects/Money';

describe('Money', () => {
  describe('constructor', () => {
    it('should create money with correct amount and currency', () => {
      const money = new Money(100.50, 'BRL');
      
      expect(money.amount).toBe(100.50);
      expect(money.currency).toBe('BRL');
      expect(money.amountInCents).toBe(10050);
    });

    it('should throw error for invalid currency', () => {
      expect(() => new Money(100, 'INVALID')).toThrow('Currency must be a 3-letter code');
    });
  });

  describe('operations', () => {
    it('should add two money amounts', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'BRL');
      const result = money1.add(money2);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('BRL');
    });

    it('should throw error when adding different currencies', () => {
      const money1 = new Money(100, 'BRL');
      const money2 = new Money(50, 'USD');
      
      expect(() => money1.add(money2)).toThrow('Cannot perform operation with different currencies');
    });
  });
});
```

### Testes de Integração

```typescript
// tests/integration/api/households.test.ts
import request from 'supertest';
import { app } from '../../../packages/interfaces/src/app';
import { HouseholdRepository } from '../../../packages/infrastructure/src/repositories/TypeOrmHouseholdRepository';

describe('Households API', () => {
  let repository: HouseholdRepository;

  beforeEach(async () => {
    // Setup do banco de teste
    repository = new HouseholdRepository();
    await repository.clear();
  });

  describe('POST /api/households', () => {
    it('should create a new household', async () => {
      const householdData = {
        name: 'Test Household',
        currency: 'BRL',
        privacyLevel: 'PRIVATE'
      };

      const response = await request(app)
        .post('/api/households')
        .send(householdData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: householdData.name,
        currency: householdData.currency,
        privacyLevel: householdData.privacyLevel
      });

      // Verificar se foi salvo no banco
      const saved = await repository.findById(response.body.id);
      expect(saved).toBeDefined();
    });

    it('should return error for invalid data', async () => {
      const invalidData = {
        name: '', // Nome vazio
        currency: 'INVALID'
      };

      await request(app)
        .post('/api/households')
        .send(invalidData)
        .expect(400);
    });
  });
});
```

### Testes E2E

```typescript
// tests/e2e/onboarding/complete-onboarding.test.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Onboarding Flow', () => {
  test('should complete onboarding for a couple', async ({ page }) => {
    // 1. Acessar página de onboarding
    await page.goto('/onboarding');
    
    // 2. Preencher dados do household
    await page.fill('[data-testid="household-name"]', 'Casa dos Sonhos');
    await page.selectOption('[data-testid="currency"]', 'BRL');
    await page.click('[data-testid="next-step"]');
    
    // 3. Adicionar primeiro parceiro
    await page.fill('[data-testid="partner-name"]', 'Alex');
    await page.fill('[data-testid="partner-email"]', 'alex@example.com');
    await page.selectOption('[data-testid="partner-pronouns"]', 'elu');
    await page.click('[data-testid="add-partner"]');
    
    // 4. Adicionar segundo parceiro
    await page.fill('[data-testid="partner-name"]', 'Sam');
    await page.fill('[data-testid="partner-email"]', 'sam@example.com');
    await page.selectOption('[data-testid="partner-pronouns"]', 'elu');
    await page.click('[data-testid="add-partner"]');
    
    // 5. Configurar acordos financeiros
    await page.click('[data-testid="agreement-type-proportional"]');
    await page.fill('[data-testid="alex-income"]', '4500');
    await page.fill('[data-testid="sam-income"]', '3200');
    await page.click('[data-testid="next-step"]');
    
    // 6. Finalizar onboarding
    await page.click('[data-testid="complete-onboarding"]');
    
    // 7. Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // 8. Verificar se dados foram salvos
    await expect(page.locator('[data-testid="household-name"]')).toContainText('Casa dos Sonhos');
    await expect(page.locator('[data-testid="partners-count"]')).toContainText('2');
  });
});
```

## 🛠️ Utilitários de Teste

### Helpers

```typescript
// tests/helpers/test-data.ts
export const createTestHousehold = () => ({
  name: 'Test Household',
  currency: 'BRL',
  privacyLevel: 'PRIVATE'
});

export const createTestPartner = () => ({
  name: 'Test Partner',
  email: 'test@example.com',
  pronouns: ['elu'],
  incomeStreams: [{
    id: '1',
    name: 'Salary',
    amount: { amount: 5000, currency: 'BRL' },
    frequency: 'monthly',
    isActive: true
  }]
});

export const createTestTransaction = () => ({
  accountId: 'test-account-id',
  amount: { amount: 100, currency: 'BRL' },
  type: 'EXPENSE',
  description: 'Test transaction',
  occurredAt: new Date()
});
```

### Fixtures

```typescript
// tests/fixtures/households.ts
export const householdFixtures = {
  complete: {
    id: 'household-1',
    name: 'Complete Household',
    currency: 'BRL',
    privacyLevel: 'PRIVATE',
    partners: [
      {
        id: 'partner-1',
        name: 'Alex',
        email: 'alex@example.com',
        pronouns: ['elu']
      },
      {
        id: 'partner-2',
        name: 'Sam',
        email: 'sam@example.com',
        pronouns: ['elu']
      }
    ]
  },
  minimal: {
    id: 'household-2',
    name: 'Minimal Household',
    currency: 'BRL',
    privacyLevel: 'PRIVATE',
    partners: []
  }
};
```

## 🔍 Debugging de Testes

### Debug de Testes Unitários

```bash
# Executar teste específico com debug
npm run test -- --testNamePattern="Money" --verbose

# Debug com Node.js
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Debug de Testes E2E

```bash
# Executar em modo não-headless
npm run test:e2e -- --headed

# Debug com breakpoints
npm run test:e2e -- --debug

# Executar teste específico
npm run test:e2e -- tests/e2e/onboarding/complete-onboarding.test.ts
```

## 📈 Métricas de Qualidade

### Coverage Goals

- **Domain**: 95%+
- **Application**: 90%+
- **Infrastructure**: 85%+
- **Interfaces**: 80%+
- **E2E**: 70%+

### Performance Goals

- **Unit Tests**: < 1s por teste
- **Integration Tests**: < 5s por teste
- **E2E Tests**: < 30s por teste

## 🚀 CI/CD

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)
- [Supertest](https://github.com/visionmedia/supertest)

## 🤝 Contribuindo com Testes

1. Siga os padrões estabelecidos
2. Escreva testes antes do código (TDD)
3. Mantenha cobertura alta
4. Documente casos complexos
5. Execute todos os testes antes de fazer PR
