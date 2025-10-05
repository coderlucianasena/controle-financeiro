module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/apps', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    '**/tests/**/*.test.ts'
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
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'packages/domain/src/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'packages/application/src/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  moduleNameMapping: {
    '^@controle-financeiro/(.*)$': '<rootDir>/packages/$1/src',
  },
  projects: [
    {
      displayName: 'domain',
      testMatch: ['<rootDir>/packages/domain/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'application',
      testMatch: ['<rootDir>/packages/application/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'infrastructure',
      testMatch: ['<rootDir>/packages/infrastructure/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'interfaces',
      testMatch: ['<rootDir>/packages/interfaces/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/packages/shared/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/apps/web/jest.setup.ts'],
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
      testEnvironment: 'node',
    },
  ],
};
