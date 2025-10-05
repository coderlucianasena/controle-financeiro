# Controle Financeiro - Sistema para Casais LGBT

Sistema de controle financeiro compartilhado voltado para casais LGBT, com foco em transparência, planejamento inclusivo e saúde financeira do relacionamento.

## 🏗️ Arquitetura

O projeto segue uma arquitetura hexagonal (Clean Architecture) organizada em monorepo:

```
controle_financeiro/
├── apps/
│   ├── web/                # Front-end React
│   └── mobile/             # React Native (futuro)
├── packages/
│   ├── domain/             # Entidades e regras de negócio
│   ├── application/        # Casos de uso
│   ├── infrastructure/     # Persistência e integrações
│   ├── interfaces/         # API e workers
│   └── shared/             # Utilitários compartilhados
├── docs/                   # Documentação
└── tests/                  # Testes automatizados
```

## 🚀 Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express/Fastify, TypeScript
- **Banco de Dados**: PostgreSQL
- **Monorepo**: Turborepo
- **Testes**: Jest, Testing Library

## 📋 Funcionalidades Principais

- ✅ Controle compartilhado e individual de finanças
- ✅ Planejamento inclusivo com metas personalizadas
- ✅ Acordos financeiros configuráveis
- ✅ Indicadores de saúde financeira do relacionamento
- ✅ Integração com bancos e importação de dados
- ✅ Relatórios mensais automatizados

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em modo desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Inicia todos os serviços em modo desenvolvimento
npm run build        # Build de produção
npm run test         # Executa todos os testes
npm run lint         # Verifica qualidade do código
npm run type-check   # Verifica tipos TypeScript
```

## 📚 Documentação

- [Arquitetura](./docs/architecture/README.md)
- [Guia de Desenvolvimento](./docs/development/README.md)
- [API Reference](./docs/api/README.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.
