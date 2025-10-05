# Guia de Contribuição

Obrigado por considerar contribuir com o projeto de controle financeiro para casais LGBT! Este guia explica como você pode contribuir de forma eficaz.

## 🤝 Como Contribuir

### Tipos de Contribuição

1. **Relatórios de Bugs**: Encontrou um problema? Reporte-o!
2. **Sugestões de Funcionalidades**: Tem uma ideia? Compartilhe!
3. **Correções de Código**: Corrigiu um bug? Envie um PR!
4. **Melhorias de Documentação**: Ajudou a documentação? Muito obrigado!
5. **Testes**: Adicionou testes? Excelente!

## 🚀 Primeiros Passos

### 1. Configurar o Ambiente

Siga o [Guia de Setup](./setup.md) para configurar seu ambiente de desenvolvimento.

### 2. Fork do Repositório

1. Faça fork do repositório no GitHub
2. Clone seu fork localmente:
   ```bash
   git clone https://github.com/seu-usuario/controle-financeiro.git
   cd controle-financeiro
   ```

### 3. Configurar Upstream

```bash
git remote add upstream https://github.com/original/controle-financeiro.git
```

## 📋 Processo de Contribuição

### 1. Criar uma Branch

```bash
# Atualizar branch principal
git checkout main
git pull upstream main

# Criar nova branch
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
# ou
git checkout -b docs/melhorias-documentacao
```

### 2. Fazer Alterações

- Siga os [Padrões de Código](./coding-standards.md)
- Escreva testes para suas alterações
- Atualize a documentação se necessário
- Certifique-se de que todos os testes passam

### 3. Commits

```bash
# Adicionar arquivos alterados
git add .

# Fazer commit com mensagem descritiva
git commit -m "feat: adiciona funcionalidade de divisão proporcional"

# Push para sua branch
git push origin feature/nova-funcionalidade
```

### 4. Pull Request

1. Vá para o GitHub e crie um Pull Request
2. Preencha o template do PR
3. Aguarde a revisão da equipe

## 📝 Padrões de Commit

Usamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações na documentação
- **style**: Formatação, espaços em branco, etc.
- **refactor**: Refatoração de código
- **test**: Adição ou correção de testes
- **chore**: Tarefas de manutenção

### Exemplos

```bash
feat(domain): adiciona entidade Goal para metas financeiras

fix(api): corrige validação de valores monetários

docs(setup): atualiza instruções de instalação

refactor(application): simplifica casos de uso de transação

test(domain): adiciona testes para classe Money
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm run test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Testes com coverage
npm run test:coverage
```

### Escrever Testes

#### Testes Unitários

```typescript
// packages/domain/src/__tests__/Money.test.ts
import { Money } from '../value-objects/Money';

describe('Money', () => {
  it('should create money with correct amount', () => {
    const money = new Money(100.50, 'BRL');
    expect(money.amount).toBe(100.50);
    expect(money.currency).toBe('BRL');
  });

  it('should add two money amounts', () => {
    const money1 = new Money(100, 'BRL');
    const money2 = new Money(50, 'BRL');
    const result = money1.add(money2);
    
    expect(result.amount).toBe(150);
  });
});
```

#### Testes de Integração

```typescript
// packages/infrastructure/src/__tests__/HouseholdRepository.test.ts
import { HouseholdRepository } from '../repositories/TypeOrmHouseholdRepository';
import { Household } from '@controle-financeiro/domain';

describe('HouseholdRepository', () => {
  let repository: HouseholdRepository;

  beforeEach(async () => {
    // Setup do banco de teste
    repository = new TypeOrmHouseholdRepository();
  });

  it('should save and retrieve household', async () => {
    const household = new Household('Test Household');
    await repository.save(household);
    
    const retrieved = await repository.findById(household.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Household');
  });
});
```

## 📏 Padrões de Código

### TypeScript

```typescript
// ✅ Bom
interface CreateHouseholdDto {
  name: string;
  currency?: string;
  privacyLevel?: PrivacyLevel;
}

class CreateHousehold {
  constructor(
    private readonly householdRepository: HouseholdRepository
  ) {}

  async execute(dto: CreateHouseholdDto): Promise<Household> {
    // Implementação
  }
}

// ❌ Ruim
function createHousehold(name: any, currency?: any) {
  // Implementação sem tipos
}
```

### React

```tsx
// ✅ Bom
interface Props {
  household: Household;
  onUpdate: (household: Household) => void;
}

export const HouseholdCard: React.FC<Props> = ({ household, onUpdate }) => {
  return (
    <div className="card">
      <h3>{household.name}</h3>
      {/* Conteúdo */}
    </div>
  );
};

// ❌ Ruim
export function HouseholdCard(props) {
  return <div>{props.household.name}</div>;
}
```

### CSS/Tailwind

```css
/* ✅ Bom - Usando classes utilitárias */
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

/* ❌ Ruim - CSS inline */
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Botão
</button>
```

## 📚 Documentação

### Atualizar Documentação

Quando adicionar novas funcionalidades:

1. Atualize o README principal se necessário
2. Adicione documentação da API
3. Atualize guias de uso
4. Adicione exemplos de código

### Formato da Documentação

```markdown
# Título da Seção

Descrição breve do que esta seção aborda.

## Subtítulo

Conteúdo detalhado com exemplos de código quando apropriado.

### Exemplo

```typescript
// Código de exemplo
const example = new Example();
```

## Referências

- [Link para documentação relacionada](./related-docs.md)
```

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]

**Informações Adicionais**
Qualquer outra informação relevante.
```

## 💡 Sugerir Funcionalidades

### Template de Feature Request

```markdown
**Funcionalidade Sugerida**
Uma descrição clara da funcionalidade.

**Problema que Resolve**
Qual problema esta funcionalidade resolveria?

**Solução Proposta**
Como você imagina que deveria funcionar?

**Alternativas Consideradas**
Outras soluções que você considerou.

**Contexto Adicional**
Qualquer contexto adicional sobre a funcionalidade.
```

## 🔍 Revisão de Código

### Como Revisar

1. **Funcionalidade**: O código faz o que deveria?
2. **Legibilidade**: O código é fácil de entender?
3. **Performance**: Há problemas de performance?
4. **Segurança**: Há vulnerabilidades de segurança?
5. **Testes**: Os testes cobrem adequadamente?
6. **Documentação**: A documentação está atualizada?

### Comentários Construtivos

```markdown
// ✅ Bom
Sugestão: Considerar usar `Money` em vez de `number` para evitar problemas de precisão.

// ❌ Ruim
Isso está errado.
```

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis

## 📋 Checklist para PRs

- [ ] Código segue os padrões estabelecidos
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Todos os testes passam
- [ ] Linting passa sem erros
- [ ] Type checking passa
- [ ] Commit messages seguem o padrão
- [ ] PR tem descrição clara

## 🎯 Roadmap

Para ver o que estamos planejando, consulte:
- [Issues](https://github.com/seu-usuario/controle-financeiro/issues)
- [Projects](https://github.com/seu-usuario/controle-financeiro/projects)
- [Milestones](https://github.com/seu-usuario/controle-financeiro/milestones)

## 🤝 Comunidade

### Canais de Comunicação

- **GitHub Issues**: Para bugs e feature requests
- **GitHub Discussions**: Para perguntas e discussões
- **Discord**: Para conversas em tempo real (link no README)

### Código de Conduta

Este projeto segue um código de conduta para garantir um ambiente inclusivo e respeitoso. Veja [CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md) para detalhes.

## 🙏 Reconhecimento

Contribuidores são reconhecidos em:
- README principal
- Release notes
- Página de contribuidores

## 📞 Suporte

Se precisar de ajuda:

1. Consulte a documentação
2. Procure em issues existentes
3. Abra uma nova issue
4. Entre em contato com a equipe

---

Obrigado por contribuir! 🎉
