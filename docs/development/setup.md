# Setup do Ambiente de Desenvolvimento

Este guia explica como configurar o ambiente de desenvolvimento para o projeto de controle financeiro.

## 📋 Pré-requisitos

### Software Necessário

- **Node.js**: Versão 18.0.0 ou superior
- **npm**: Versão 9.0.0 ou superior
- **PostgreSQL**: Versão 14.0 ou superior
- **Git**: Para controle de versão

### Ferramentas Recomendadas

- **VS Code**: Editor de código recomendado
- **Docker**: Para containerização (opcional)
- **Postman**: Para testes de API (opcional)

## 🚀 Configuração Inicial

### 1. Clone do Repositório

```bash
git clone https://github.com/seu-usuario/controle-financeiro.git
cd controle-financeiro
```

### 2. Instalação de Dependências

```bash
# Instalar dependências do monorepo
npm install

# Instalar dependências de todos os packages
npm run install:all
```

### 3. Configuração do Banco de Dados

#### Opção A: PostgreSQL Local

```bash
# Criar banco de dados
createdb controle_financeiro

# Configurar variáveis de ambiente
cp .env.example .env.local
```

#### Opção B: Docker

```bash
# Iniciar PostgreSQL com Docker
docker run --name controle-financeiro-db \
  -e POSTGRES_DB=controle_financeiro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Configuração de Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/controle_financeiro
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=controle_financeiro
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Application
NODE_ENV=development
PORT=3000
API_PORT=3001

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# External Services
BANK_API_URL=https://api.bank.com
EMAIL_SERVICE_URL=https://api.email.com
EMAIL_API_KEY=your-email-api-key

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

### 5. Execução de Migrações

```bash
# Executar migrações do banco
npm run db:migrate

# Popular banco com dados de teste (opcional)
npm run db:seed
```

## 🏗️ Estrutura do Projeto

```
controle_financeiro/
├── apps/
│   ├── web/                    # Frontend React
│   └── mobile/                 # React Native (futuro)
├── packages/
│   ├── domain/                 # Camada de Domínio
│   ├── application/            # Camada de Aplicação
│   ├── infrastructure/         # Camada de Infraestrutura
│   ├── interfaces/             # Camada de Interfaces
│   └── shared/                 # Utilitários Compartilhados
├── docs/                       # Documentação
├── tests/                      # Testes E2E
├── .env.example               # Exemplo de variáveis
├── package.json               # Configuração do monorepo
├── turbo.json                 # Configuração do Turborepo
└── tsconfig.json              # Configuração TypeScript
```

## 🛠️ Scripts Disponíveis

### Scripts do Monorepo

```bash
# Desenvolvimento
npm run dev                    # Inicia todos os serviços
npm run dev:web               # Apenas o frontend
npm run dev:api               # Apenas a API

# Build
npm run build                 # Build de produção
npm run build:web            # Build do frontend
npm run build:api            # Build da API

# Testes
npm run test                  # Todos os testes
npm run test:unit            # Testes unitários
npm run test:integration     # Testes de integração
npm run test:e2e             # Testes E2E

# Qualidade de Código
npm run lint                  # Verificar código
npm run lint:fix             # Corrigir problemas
npm run type-check           # Verificar tipos
npm run format               # Formatar código

# Banco de Dados
npm run db:migrate           # Executar migrações
npm run db:rollback          # Reverter migrações
npm run db:seed              # Popular dados de teste
npm run db:reset             # Resetar banco
```

### Scripts por Package

```bash
# Domain
cd packages/domain
npm run build
npm run test
npm run lint

# Application
cd packages/application
npm run build
npm run test
npm run lint

# Infrastructure
cd packages/infrastructure
npm run build
npm run test
npm run lint

# Interfaces
cd packages/interfaces
npm run build
npm run test
npm run lint

# Web App
cd apps/web
npm run dev
npm run build
npm run test
npm run lint
```

## 🔧 Configuração do VS Code

### Extensões Recomendadas

Instale as seguintes extensões no VS Code:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-markdown",
    "ms-vscode.vscode-git",
    "ms-vscode.vscode-docker"
  ]
}
```

### Configurações do Workspace

Crie o arquivo `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.workingDirectories": [
    "packages/domain",
    "packages/application",
    "packages/infrastructure",
    "packages/interfaces",
    "packages/shared",
    "apps/web"
  ],
  "jest.jestCommandLine": "npm run test",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

## 🧪 Configuração de Testes

### Testes Unitários

```bash
# Executar testes de um package específico
cd packages/domain
npm run test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

### Testes de Integração

```bash
# Executar testes de integração
npm run test:integration

# Executar testes de integração com banco
npm run test:integration:db
```

### Testes E2E

```bash
# Executar testes E2E
npm run test:e2e

# Executar testes E2E em modo headless
npm run test:e2e:headless
```

## 📊 Monitoramento e Logs

### Logs de Desenvolvimento

```bash
# Ver logs em tempo real
npm run logs

# Ver logs de um serviço específico
npm run logs:web
npm run logs:api
```

### Métricas de Performance

```bash
# Análise de bundle
npm run analyze

# Análise de dependências
npm run analyze:deps
```

## 🐛 Debugging

### Debug do Frontend

1. Abra o VS Code
2. Vá para a aba "Run and Debug"
3. Selecione "Debug Web App"
4. Pressione F5

### Debug da API

1. Abra o VS Code
2. Vá para a aba "Run and Debug"
3. Selecione "Debug API"
4. Pressione F5

### Debug de Testes

```bash
# Debug de testes unitários
npm run test:debug

# Debug de testes de integração
npm run test:integration:debug
```

## 🚀 Deploy Local

### Desenvolvimento

```bash
# Iniciar ambiente de desenvolvimento
npm run dev

# Acessar aplicação
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

### Produção Local

```bash
# Build de produção
npm run build

# Iniciar em modo produção
npm run start

# Acessar aplicação
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Verificar configuração de conexão
npm run db:check
```

#### 2. Erro de Dependências

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### 3. Erro de TypeScript

```bash
# Verificar tipos
npm run type-check

# Recompilar
npm run build
```

#### 4. Erro de Porta em Uso

```bash
# Verificar portas em uso
lsof -i :3000
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>
```

## 📚 Recursos Adicionais

- [Documentação da API](../api/README.md)
- [Guia de Contribuição](./contributing.md)
- [Padrões de Código](./coding-standards.md)
- [Arquitetura do Sistema](../architecture/README.md)

## 🤝 Suporte

Se encontrar problemas durante a configuração:

1. Consulte a documentação
2. Verifique os logs de erro
3. Abra uma issue no GitHub
4. Entre em contato com a equipe
