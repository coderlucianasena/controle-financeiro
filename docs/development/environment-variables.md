# Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente utilizadas no sistema de controle financeiro.

## 📋 Visão Geral

As variáveis de ambiente são organizadas por categoria e seguem uma convenção de nomenclatura consistente. Todas as variáveis sensíveis devem ser configuradas via arquivo `.env.local` (nunca versionado) ou através de um gerenciador de secrets em produção.

## 🔒 Segurança

### Variáveis Sensíveis
- **NUNCA** versionar arquivos `.env` com dados sensíveis
- **SEMPRE** usar `.env.local` para desenvolvimento
- **SEMPRE** usar secrets managers em produção
- **SEMPRE** validar variáveis obrigatórias no boot da aplicação

### Validação de Variáveis
```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  // ... outras variáveis
});

export const env = envSchema.parse(process.env);
```

## 📂 Categorias de Variáveis

### 1. Configuração do Banco de Dados

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `DATABASE_URL` | string | ✅ | URL completa de conexão com PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `DATABASE_HOST` | string | ❌ | Host do banco de dados | `localhost` |
| `DATABASE_PORT` | number | ❌ | Porta do banco de dados | `5432` |
| `DATABASE_NAME` | string | ❌ | Nome do banco de dados | `controle_financeiro` |
| `DATABASE_USER` | string | ❌ | Usuário do banco de dados | `postgres` |
| `DATABASE_PASSWORD` | string | ❌ | Senha do banco de dados | `password` |
| `DATABASE_SSL` | boolean | ❌ | Usar SSL na conexão | `true` |

**Configuração de Desenvolvimento:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/controle_financeiro_dev
DATABASE_SSL=false
```

**Configuração de Produção:**
```env
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/controle_financeiro
DATABASE_SSL=true
```

### 2. Configuração da Aplicação

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `NODE_ENV` | string | ✅ | Ambiente de execução | `development`, `production`, `test` |
| `PORT` | number | ❌ | Porta do servidor web | `3000` |
| `API_PORT` | number | ❌ | Porta da API | `3001` |
| `FRONTEND_URL` | string | ❌ | URL do frontend | `http://localhost:3000` |
| `API_URL` | string | ❌ | URL da API | `http://localhost:3001` |

### 3. Configuração de Segurança

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `JWT_SECRET` | string | ✅ | Chave secreta para JWT (min 32 chars) | `your-super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | string | ❌ | Tempo de expiração do JWT | `7d`, `24h` |
| `ENCRYPTION_KEY` | string | ✅ | Chave de criptografia (32 chars) | `your-32-character-encryption-key` |
| `SESSION_SECRET` | string | ❌ | Chave secreta para sessões | `your-session-secret-key` |

**Geração de Chaves:**
```bash
# JWT Secret (32+ caracteres)
openssl rand -base64 32

# Encryption Key (32 caracteres)
openssl rand -hex 16
```

### 4. Configuração de Email

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `EMAIL_SERVICE` | string | ❌ | Serviço de email | `sendgrid`, `ses`, `smtp` |
| `EMAIL_API_KEY` | string | ❌ | Chave da API do serviço | `SG.xxx` |
| `EMAIL_FROM` | string | ❌ | Email remetente | `noreply@controlefinanceiro.com` |
| `EMAIL_FROM_NAME` | string | ❌ | Nome do remetente | `Controle Financeiro` |

**Configuração SendGrid:**
```env
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.your-sendgrid-api-key
EMAIL_FROM=noreply@controlefinanceiro.com
EMAIL_FROM_NAME=Controle Financeiro
```

### 5. Configuração de Integração Bancária

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `BANK_API_URL` | string | ❌ | URL da API bancária | `https://api.bank.com` |
| `BANK_API_KEY` | string | ❌ | Chave da API bancária | `your-bank-api-key` |
| `BANK_API_SECRET` | string | ❌ | Secret da API bancária | `your-bank-api-secret` |

### 6. Configuração de Notificações

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `NOTIFICATION_SERVICE` | string | ❌ | Serviço de notificações | `firebase`, `onesignal` |
| `FIREBASE_PROJECT_ID` | string | ❌ | ID do projeto Firebase | `your-firebase-project-id` |
| `FIREBASE_PRIVATE_KEY` | string | ❌ | Chave privada do Firebase | `-----BEGIN PRIVATE KEY-----` |
| `FIREBASE_CLIENT_EMAIL` | string | ❌ | Email do cliente Firebase | `firebase-adminsdk-xxx@project.iam.gserviceaccount.com` |

### 7. Configuração de Arquivos

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `UPLOAD_MAX_SIZE` | number | ❌ | Tamanho máximo de upload (bytes) | `10485760` (10MB) |
| `UPLOAD_ALLOWED_TYPES` | string | ❌ | Tipos de arquivo permitidos | `image/jpeg,image/png,application/pdf` |
| `STORAGE_PROVIDER` | string | ❌ | Provedor de armazenamento | `local`, `s3`, `gcs` |
| `STORAGE_PATH` | string | ❌ | Caminho de armazenamento | `./uploads` |

### 8. Configuração de Log

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `LOG_LEVEL` | string | ❌ | Nível de log | `error`, `warn`, `info`, `debug` |
| `LOG_FORMAT` | string | ❌ | Formato do log | `json`, `text` |
| `LOG_FILE` | string | ❌ | Arquivo de log | `./logs/app.log` |

### 9. Configuração de Cache

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `REDIS_URL` | string | ❌ | URL do Redis | `redis://localhost:6379` |
| `REDIS_PASSWORD` | string | ❌ | Senha do Redis | `redis-password` |
| `CACHE_TTL` | number | ❌ | TTL do cache (segundos) | `3600` |

### 10. Configuração de Monitoramento

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `SENTRY_DSN` | string | ❌ | DSN do Sentry | `https://xxx@sentry.io/xxx` |
| `ANALYTICS_ID` | string | ❌ | ID do Analytics | `GA-XXX` |

### 11. Configuração de Desenvolvimento

| Variável | Tipo | Obrigatória | Descrição | Exemplo |
|----------|------|-------------|-----------|---------|
| `DEBUG` | boolean | ❌ | Modo debug | `true`, `false` |
| `HOT_RELOAD` | boolean | ❌ | Hot reload habilitado | `true`, `false` |
| `CORS_ORIGIN` | string | ❌ | Origem CORS | `http://localhost:3000` |

## 🏗️ Configuração por Ambiente

### Desenvolvimento

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/controle_financeiro_dev
JWT_SECRET=dev-jwt-secret-key-min-32-chars
ENCRYPTION_KEY=dev-encryption-key-32-chars
DEBUG=true
HOT_RELOAD=true
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
LOG_FORMAT=text
```

### Teste

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/controle_financeiro_test
JWT_SECRET=test-jwt-secret-key-min-32-chars
ENCRYPTION_KEY=test-encryption-key-32-chars
DEBUG=false
LOG_LEVEL=error
LOG_FORMAT=json
```

### Produção

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/controle_financeiro
DATABASE_SSL=true
JWT_SECRET=prod-jwt-secret-key-min-32-chars
ENCRYPTION_KEY=prod-encryption-key-32-chars
DEBUG=false
HOT_RELOAD=false
LOG_LEVEL=warn
LOG_FORMAT=json
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🔧 Configuração de Secrets Managers

### AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

export async function getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return response.SecretString || '';
}
```

### Google Secret Manager

```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `${secretName}/versions/latest`,
  });
  return version.payload?.data?.toString() || '';
}
```

### Azure Key Vault

```typescript
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

const credential = new DefaultAzureCredential();
const client = new SecretClient('https://your-vault.vault.azure.net/', credential);

export async function getSecret(secretName: string): Promise<string> {
  const secret = await client.getSecret(secretName);
  return secret.value || '';
}
```

## 🚀 Docker

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/controle_financeiro
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    env_file:
      - .env.production
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=controle_financeiro
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    command: redis-server --requirepass ${REDIS_PASSWORD}

volumes:
  postgres_data:
```

## 📊 Monitoramento

### Health Check

```typescript
// src/health/health.controller.ts
export class HealthController {
  async check(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
    ]);

    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: checks.map((check, index) => ({
        name: ['database', 'redis', 'external'][index],
        status: check.status,
        details: check.status === 'fulfilled' ? check.value : check.reason,
      })),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    };
  }
}
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Variável não encontrada**
   ```bash
   Error: Required environment variable 'DATABASE_URL' is not set
   ```
   **Solução**: Verificar se o arquivo `.env.local` existe e contém a variável.

2. **Formato de variável inválido**
   ```bash
   Error: Invalid JWT_SECRET: must be at least 32 characters
   ```
   **Solução**: Gerar uma chave com pelo menos 32 caracteres.

3. **Conexão com banco falhou**
   ```bash
   Error: Connection to database failed
   ```
   **Solução**: Verificar `DATABASE_URL` e se o PostgreSQL está rodando.

### Ferramentas de Debug

```bash
# Verificar variáveis de ambiente
npm run env:check

# Validar configuração
npm run env:validate

# Gerar chaves seguras
npm run env:generate-keys
```

## 📚 Recursos Adicionais

- [Configuração de Segurança](./security.md)
- [Guia de Deploy](./deploy.md)
- [Monitoramento e Observabilidade](./monitoring.md)
- [Secrets Management Best Practices](https://12factor.net/config)
