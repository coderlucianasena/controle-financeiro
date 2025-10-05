import '@testing-library/jest-dom';

// Configurar timeout para testes
jest.setTimeout(10000);

// Mock de variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key';

// Mock de console para reduzir ruído nos testes
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Error:'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Mock de fetch para testes
global.fetch = jest.fn();

// Mock de crypto para testes
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
    getRandomValues: jest.fn((arr) => arr.map(() => Math.floor(Math.random() * 256))),
  },
});

// Mock de Date.now para testes determinísticos
const mockDate = new Date('2024-01-01T00:00:00Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock de Intl para formatação de moeda
global.Intl = {
  ...global.Intl,
  NumberFormat: jest.fn(() => ({
    format: jest.fn((value) => `R$ ${value.toFixed(2).replace('.', ',')}`),
  })),
};
