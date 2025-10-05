# Documentação do Controle Financeiro

Bem-vindo à documentação do sistema de controle financeiro para casais LGBT. Esta documentação abrange todos os aspectos do projeto, desde a arquitetura até guias de uso.

## 📚 Estrutura da Documentação

### 🏗️ [Arquitetura](./architecture/)
- [Visão Geral](./architecture/README.md)
- [Arquitetura Hexagonal](./architecture/hexagonal-architecture.md)
- [Diagramas de Sistema](./architecture/system-diagrams.md)
- [ADRs (Architecture Decision Records)](./architecture/adrs/)

### 👥 [Produto](./product/)
- [Personas](./product/personas.md)
- [Jornadas do Usuário](./product/user-journeys.md)
- [Acordos Financeiros](./product/financial-agreements.md)
- [Casos de Uso](./product/use-cases.md)

### 🚀 [Desenvolvimento](./development/)
- [Guia de Contribuição](./development/contributing.md)
- [Setup do Ambiente](./development/setup.md)
- [Padrões de Código](./development/coding-standards.md)
- [Testes](./development/testing.md)

### 📖 [API](./api/)
- [Referência da API](./api/README.md)
- [Autenticação](./api/authentication.md)
- [Endpoints](./api/endpoints/)
- [Exemplos](./api/examples/)

### 🎯 [Playbooks](./playbooks/)
- [Rituais de Revisão Financeira](./playbooks/monthly-review.md)
- [Processo de Onboarding](./playbooks/onboarding.md)
- [Resolução de Conflitos](./playbooks/conflict-resolution.md)

## 🎯 Objetivo do Projeto

O Controle Financeiro é um sistema desenvolvido especificamente para casais LGBT, com foco em:

- **Transparência**: Controle compartilhado e individual com visibilidade configurável
- **Inclusividade**: Planejamento que considera diferentes realidades financeiras
- **Equilíbrio**: Acordos flexíveis e indicadores de saúde financeira
- **Comunicação**: Ferramentas para facilitar diálogo sobre finanças

## 🏛️ Arquitetura

O projeto segue uma arquitetura hexagonal (Clean Architecture) organizada em:

- **Domain**: Entidades e regras de negócio puras
- **Application**: Casos de uso e orquestração
- **Infrastructure**: Persistência e integrações externas
- **Interfaces**: API e workers
- **Shared**: Utilitários e tipos comuns

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

## 🤝 Contribuição

Para contribuir com o projeto, consulte o [Guia de Contribuição](./development/contributing.md).

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../../LICENSE) para detalhes.
