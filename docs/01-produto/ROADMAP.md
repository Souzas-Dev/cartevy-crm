# Roadmap do Produto

**Documento:** PRD-004 — Roadmap do Produto
**Versão:** 0.8
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 23/09/2026

---

## 1. Finalidade

Este documento organiza a evolução do Cartevy CRM em fases coerentes com o estágio documental e com o escopo do MVP definido em PRD-001 e PRD-002.

Ele não substitui os requisitos detalhados e deve ser usado como referência de progressão do projeto, sem prometer entregas que ainda não tenham sido aprovadas.

## 2. Estado atual

O projeto concluiu a **Fase 3 — Persistência e domínio**.

A persistência foi revisada a partir de pedidos reais da operação e validada contra o PostgreSQL gerenciado pelo Supabase.

A Fase 3 entregou:

- PostgreSQL gerenciado pelo Supabase;
- Prisma 7;
- conexão TLS validada com CA oficial do Supabase;
- cinco migrations aplicadas e versionadas;
- `Organization`;
- `AppUser`;
- `Customer`;
- `Order`;
- `OrderItem`;
- `FollowUp`;
- `Backorder`;
- pedidos com ou sem cliente formalmente cadastrado;
- snapshot do nome apresentado no pedido;
- código interno obrigatório para `Customer`;
- ausência de associação automática por nome;
- enriquecimento apenas de campos vazios;
- preservação de valores já existentes;
- gravação transacional de pedido e itens;
- prevenção de duplicidade de pedido confirmado;
- isolamento por organização;
- foreign keys compostas;
- RLS habilitado;
- seed controlado;
- testes de domínio;
- teste real de persistência contra o Supabase;
- integração contínua e proteção da branch `main`.

A autenticação permanece fora da Fase 3.

A próxima etapa é a **Fase 4 — Autenticação**.
## 3. Fases do projeto

### Fase 0 — Fundação documental

**Status:** Aprovado

Objetivo:

- consolidar a visão do produto;
- definir o escopo do MVP;
- registrar requisitos iniciais;
- documentar diretrizes gerais do projeto.

### Fase 1 — Estrutura técnica do projeto

**Status:** Aprovado

Objetivo:

- iniciar a organização do repositório;
- preparar a base técnica do projeto;
- definir a estrutura inicial da aplicação;
- estabelecer a base para o desenvolvimento futuro.

Progresso registrado:

- repositório Git inicializado e publicado no GitHub;
- estrutura manual da aplicação Next.js criada;
- Next.js, React e TypeScript configurados;
- ESLint configurado e validado sem erros;
- Tailwind CSS e PostCSS configurados;
- estrutura inicial do App Router criada;
- dependências instaladas e compatibilizadas;
- build de produção executado com sucesso;
- rota inicial da aplicação validada como conteúdo estático.

### Fase 2 — Fundação da aplicação

**Status:** Aprovado

Objetivo:

- criar a base da interface e da aplicação principal;
- preparar a navegação e os módulos iniciais;
- validar a estrutura da rotina comercial em operação.

Entregas concluídas:

- criação do Route Group `(crm)`;
- implementação do shell compartilhado das rotas do CRM;
- criação das rotas de Dashboard, Pedidos, Clientes, Follow-ups, Encomendas e Configurações;
- implementação da navegação principal;
- identificação visual da rota ativa;
- implementação da estrutura inicial do Dashboard;
- sidebar adaptativa com comportamento para desktop e mobile;
- gerenciamento básico de foco durante abertura e fechamento do menu;
- modos claro e escuro;
- persistência local da preferência de tema;
- tipografia híbrida;
- componentes reutilizáveis `PageHeader`, `Surface` e `ModulePlaceholder`;
- preparação responsiva inicial;
- validação manual da navegação, sidebar e alternância de tema;
- validação técnica por ESLint e build de produção.

A paleta neutra utilizada durante esta fase permanece provisória.

### Fase 3 — Persistência e domínio

**Status:** concluída

Objetivo:

- modelar os dados principais;
- definir persistência e integridade;
- estabelecer regras centrais de domínio;
- preparar uma base segura para o núcleo comercial.

Entregas concluídas:

- PostgreSQL gerenciado pelo Supabase;
- Prisma 7;
- cinco migrations aplicadas;
- constraints e índices;
- RLS habilitado;
- modelo revisado com pedidos reais;
- entidade `OrderItem`;
- pedidos sem `Customer` para vendas sem cadastro;
- código interno obrigatório em clientes formais;
- nome fora da estratégia de identidade;
- enriquecimento controlado;
- bloqueio de sobrescrita silenciosa;
- repositories e services;
- persistência transacional;
- seed controlado;
- testes de domínio;
- testes reais de persistência e isolamento.

A Fase 3 não inclui autenticação, policies RLS baseadas em identidade, CRUD comercial completo, monitor Python, bot do Telegram ou geração automática de follow-ups.
### Fase 4 — Autenticação

**Status:** próxima

Objetivo:

- proteger o acesso às áreas internas;
- associar registros a usuários e responsabilidades;
- implementar autorização coerente com a separação por organização;
- preparar a aplicação para evolução de uso individual para uso compartilhado.

### Fase 5 — Núcleo comercial

**Status:** Aprovado

Objetivo:

- disponibilizar clientes, pedidos, histórico, follow-ups e encomendas;
- consolidar o cotidiano operacional do CRM;
- permitir uso real do sistema sem dependência de automações auxiliares.

### Fase 6 — Ingestão local e preparação de pedidos

**Status:** futura

Objetivo:

- implementar o monitor Python da estrutura local de pedidos;
- extrair somente os campos definidos para o Cartevy;
- preparar dados estruturados temporários;
- manter a preparação resistente a reinicialização;
- preservar a versão mais recente de um pedido antes da confirmação;
- disponibilizar os dados para validação posterior.

### Fase 7 — Validação operacional via Telegram

**Status:** futura

Objetivo:

- implementar o bot do Telegram como etapa de validação;
- validar os pedidos contra os dados preparados;
- promover somente pedidos confirmados ao banco oficial;
- preservar idempotência;
- impedir sobrescrita silenciosa de pedido já confirmado.
### Fase 8 — Deploy e estabilização

**Status:** Aprovado

Objetivo:

- preparar a aplicação para execução em ambiente real;
- estabilizar a operação;
- revisar documentação, segurança e uso em produção.

### Fase 9 — Validação do MVP

**Status:** Aprovado

Objetivo:

- verificar se a solução atende ao escopo acordado;
- confirmar estabilidade e maturidade do produto inicial;
- registrar alterações finais antes da entrada em uso operacional.

## 4. Critérios de progressão

A transição entre fases deve ocorrer somente quando:

- a etapa anterior estiver concluída e validada;
- os objetivos da fase seguinte estiverem claramente definidos;
- o escopo permanecer coerente com PRD-001 e PRD-002;
- as mudanças relevantes forem documentadas;
- a evolução não introduzir complexidade desnecessária;
- os gates técnicos aplicáveis estiverem aprovados.

Para mudanças versionadas no repositório, a branch `main` deve permanecer protegida pelo fluxo de Pull Request e pelos checks de CI definidos para o projeto.

## 5. Evoluções posteriores ao MVP

Após a validação do MVP, poderão ser avaliadas evoluções como:

- múltiplos usuários;
- múltiplos vendedores;
- diferentes níveis de acesso;
- múltiplas organizações;
- indicadores mais avançados;
- integrações complementares;
- automações adicionais;
- expansão do produto para uso mais amplo.

A modelagem atual já prepara associações por organização e responsável, mas isso não transforma essas evoluções em funcionalidades concluídas.

## 6. Estado do documento

A versão 0.8 registra a conclusão da **Fase 3 — Persistência e domínio**.

A etapa foi encerrada após revisão do modelo com pedidos reais, aplicação de cinco migrations, implementação da camada transacional de persistência e validação contra o PostgreSQL real.

Também passa a constar como direção aprovada para a futura ingestão:

`pasta local → monitor Python → staging temporário → Telegram → validação → PostgreSQL oficial → Cartevy CRM`.

Monitor local, staging e Telegram ainda não estão implementados.

A **Fase 4 — Autenticação** passa a ser a próxima etapa.
