# Roadmap do Produto

**Documento:** PRD-004 — Roadmap do Produto
**Versão:** 0.7
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 23/09/2026

---

## 1. Finalidade

Este documento organiza a evolução do Cartevy CRM em fases coerentes com o estágio documental e com o escopo do MVP definido em PRD-001 e PRD-002.

Ele não substitui os requisitos detalhados e deve ser usado como referência de progressão do projeto, sem prometer entregas que ainda não tenham sido aprovadas.

## 2. Estado atual

O projeto concluiu a **Fase 2 — Fundação da aplicação** e está em andamento na **Fase 3 — Persistência e domínio**.

A fundação visual e navegável entregue na Fase 2 permanece válida, incluindo:

- Route Group `(crm)`;
- shell compartilhado;
- Dashboard;
- Pedidos;
- Clientes;
- Follow-ups;
- Encomendas;
- Configurações;
- sidebar adaptativa;
- identificação visual da rota ativa;
- modos claro e escuro;
- persistência local da preferência de tema;
- componentes reutilizáveis;
- responsividade inicial;
- acessibilidade básica;
- validação por lint, build e navegação manual.

Na Fase 3 já foram implementadas e validadas as seguintes capacidades:

- PostgreSQL gerenciado pelo Supabase como persistência da aplicação;
- Prisma 7 como ORM e mecanismo de migrations;
- conexão de runtime por Supavisor Transaction Pooler;
- conexão de migrations por Supavisor Session Pooler;
- verificação TLS com CA do Supabase e `rejectUnauthorized: true`;
- modelagem inicial de Organization, AppUser, Customer, Order, FollowUp e Backorder;
- preparação multi-tenant por `organizationId` e relacionamentos compostos;
- constraints de integridade para documentos, telefone, valores e conclusão de follow-ups;
- migration inicial do domínio;
- migration adicional de hardening para RLS e índices de foreign keys;
- RLS habilitado nas seis tabelas de aplicação e na tabela `_prisma_migrations`;
- testes iniciais de normalização, validação, invariantes e classificação de follow-ups;
- integração contínua pelo GitHub Actions;
- proteção da branch `main`, exigindo Pull Request e o check `Quality`.

A Fase 3 ainda não está concluída. Permanecem nesta etapa a consolidação da camada de persistência do domínio, serviços/repositórios, seed controlado e testes de persistência suficientes para sustentar o núcleo comercial.

A autenticação permanece fora do escopo da Fase 3 e será tratada na Fase 4.

## 3. Fases do projeto

### Fase 0 — Fundação documental

**Status:** concluída

Objetivo:

- consolidar a visão do produto;
- definir o escopo do MVP;
- registrar requisitos iniciais;
- documentar diretrizes gerais do projeto.

### Fase 1 — Estrutura técnica do projeto

**Status:** concluída

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

**Status:** concluída

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

**Status:** em andamento

Objetivo:

- modelar os dados principais;
- definir persistência e integridade;
- estabelecer as regras de negócio centrais;
- preparar uma base segura para o núcleo comercial.

Entregas já concluídas nesta fase:

- escolha arquitetural de PostgreSQL gerenciado pelo Supabase;
- integração do Prisma 7 com PostgreSQL;
- schema inicial do domínio;
- migrations versionadas;
- constraints de integridade;
- RLS habilitado desde a fundação;
- índices adicionais para foreign keys compostas;
- testes iniciais de domínio;
- CI no GitHub Actions;
- proteção da branch `main`.

Pendências da fase:

- seed controlado;
- camada de persistência do domínio;
- serviços/repositórios;
- testes de persistência e isolamento por organização;
- consolidação das regras de criação, consulta e atualização necessárias ao núcleo comercial.

A autenticação e as policies de acesso associadas a identidades autenticadas permanecem fora desta fase.

### Fase 4 — Autenticação

**Status:** futura

Objetivo:

- proteger o acesso às áreas internas;
- associar registros a usuários e responsabilidades;
- implementar autorização coerente com a separação por organização;
- preparar a aplicação para evolução de uso individual para uso compartilhado.

### Fase 5 — Núcleo comercial

**Status:** futura

Objetivo:

- disponibilizar clientes, pedidos, histórico, follow-ups e encomendas;
- consolidar o cotidiano operacional do CRM;
- permitir uso real do sistema sem dependência de automações auxiliares.

### Fase 6 — Importação de pedidos por PDF

**Status:** futura

Objetivo:

- reduzir a digitação manual;
- extrair dados estruturados de pedidos em PDF;
- validar e registrar informações relevantes;
- prevenir duplicidade de pedidos.

### Fase 7 — Integrações condicionadas

**Status:** condicionada

Objetivo:

- implementar canais auxiliares apenas se a necessidade for confirmada;
- manter Telegram e monitor local como capacidades planejadas, mas não obrigatórias para o MVP inicial.

### Fase 8 — Deploy e estabilização

**Status:** futura

Objetivo:

- preparar a aplicação para execução em ambiente real;
- estabilizar a operação;
- revisar documentação, segurança e uso em produção.

### Fase 9 — Validação do MVP

**Status:** futura

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

A versão 0.7 registra o início efetivo da **Fase 3 — Persistência e domínio**.

Nesta versão passam a constar como implementadas a fundação PostgreSQL/Supabase, a integração com Prisma 7, a modelagem inicial do domínio, as migrations, o hardening de RLS e índices, os testes iniciais de domínio e o pipeline de CI com proteção da branch `main`.

A Fase 3 permanece **em andamento**.

Autenticação, autorização completa, policies baseadas em identidade, CRUD comercial e demais entregas do núcleo comercial ainda não são consideradas concluídas.
