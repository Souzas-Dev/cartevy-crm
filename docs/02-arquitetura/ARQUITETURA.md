# Arquitetura da Aplicação

**Documento:** ARC-001 — Arquitetura da Aplicação
**Versão:** 0.3
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 23/09/2026

---

## 1. Finalidade

Este documento registra a visão arquitetural atualmente sustentada pelo projeto Cartevy CRM.

Ele não pretende estabelecer uma arquitetura definitiva para todos os cenários futuros, mas preservar as direções conhecidas, as decisões formalizadas e os limites atuais da aplicação.

## 2. Direção atual

A aplicação principal permanece estruturada como uma única aplicação Next.js, com frontend e capacidades de servidor convivendo na mesma base enquanto não houver requisito concreto que justifique separação adicional.

A fundação técnica está formalizada em `ADR-001 — Fundação Técnica Inicial da Aplicação`.

A persistência está formalizada em `ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase`.

A arquitetura atualmente adotada utiliza:

- Next.js com App Router;
- React;
- TypeScript;
- Tailwind CSS com PostCSS;
- ESLint;
- npm;
- PostgreSQL gerenciado pelo Supabase;
- Prisma 7;
- `@prisma/adapter-pg`;
- Zod para validação de entrada;
- Vitest para testes;
- GitHub Actions para integração contínua.

A autenticação ainda não foi formalizada nem implementada e permanece como decisão posterior.

Hospedagem da aplicação e infraestrutura definitiva de execução também permanecem pendentes.

## 3. Escopo arquitetural

A arquitetura deve apoiar:

- cadastro e consulta de clientes;
- registro e acompanhamento de pedidos;
- histórico comercial;
- follow-ups;
- encomendas;
- indicadores e consultas comerciais;
- importação de pedidos a partir de PDF;
- associação de registros a organização e responsável;
- evolução futura para múltiplos usuários e organizações.

A arquitetura não deve ampliar o escopo da solução para áreas que não fazem parte do objetivo central do produto, como faturamento, estoque, logística e gestão financeira.

## 4. Estrutura conceitual

### 4.1 Aplicação principal

A aplicação principal está localizada no diretório `app` e utiliza Next.js, React e TypeScript.

Ela concentra:

- interface e navegação;
- capacidades de servidor;
- regras de domínio;
- acesso à persistência;
- consultas e indicadores futuros;
- interfaces controladas para importações e automações auxiliares.

A concentração em uma base única continua intencional para o estágio atual.

### 4.2 Camada de domínio

O diretório `app/src/domain` concentra regras e utilitários de domínio que não devem depender diretamente da interface.

A fundação atual inclui:

- normalização de documento, telefone, e-mail e código interno;
- schemas de validação;
- invariantes de organização;
- classificação derivada de follow-ups;
- testes automatizados dessas regras.

A camada ainda deverá evoluir para serviços e operações de persistência controladas antes da conclusão da Fase 3.

### 4.3 Persistência

A persistência utiliza PostgreSQL gerenciado pelo Supabase.

O Prisma atua como:

- definição versionada do schema;
- cliente de acesso ao banco;
- mecanismo de migrations da aplicação.

A aplicação usa duas formas de conexão:

- `DATABASE_URL` para runtime por Supavisor Transaction Pooler;
- `DIRECT_URL` para Prisma CLI e migrations por Supavisor Session Pooler.

A verificação TLS utiliza a CA oficial do Supabase com validação de certificado habilitada.

O histórico de migrations da aplicação é mantido pelo Prisma em `public._prisma_migrations`. O histórico próprio do Supabase CLI não é utilizado como fonte de verdade para as migrations do schema da aplicação.

### 4.4 Modelo inicial

A modelagem inicial contém:

- `Organization`;
- `AppUser`;
- `Customer`;
- `Order`;
- `FollowUp`;
- `Backorder`.

Todas as entidades comerciais carregam associação com organização.

Relacionamentos sensíveis utilizam foreign keys compostas que incluem `organizationId`, reduzindo a possibilidade de relacionar registros pertencentes a organizações diferentes.

Essa proteção relacional não substitui autorização server-side nem filtros por organização nas consultas.

### 4.5 Integridade e RLS

A integridade atual combina:

- constraints do schema relacional;
- índices;
- checks no PostgreSQL;
- validações de domínio antes da persistência;
- RLS habilitado nas tabelas públicas da aplicação.

RLS está habilitado em:

- `organizations`;
- `app_users`;
- `customers`;
- `orders`;
- `follow_ups`;
- `backorders`;
- `_prisma_migrations`.

Ainda não existem policies de acesso baseadas em identidade.

Isso é intencional enquanto a Fase 4 — Autenticação não estiver implementada.

O acesso Prisma atual utiliza credencial de servidor e, portanto, a aplicação deverá impor explicitamente isolamento por organização e autorização na camada server-side.

### 4.6 Automação externa

Componentes externos, quando aprovados, podem interagir com a aplicação principal por interfaces controladas.

Python permanece uma opção para processamento auxiliar, especialmente leitura e validação de documentos PDF.

### 4.7 PDF e dados estruturados

O arquivo PDF não é considerado repositório definitivo do sistema.

A prioridade é validar e persistir dados estruturados extraídos, prevenindo duplicidade e evitando transformar o CRM em armazenamento documental permanente.

## 5. Migrations e estado do banco

A persistência possui duas migrations aplicadas e versionadas:

- `20260923_initial_domain`;
- `20260923_harden_persistence`.

A primeira estabelece o domínio relacional, constraints e RLS das tabelas de aplicação.

A segunda habilita RLS na tabela interna de migrations do Prisma e adiciona índices de suporte às foreign keys compostas identificadas pelos advisors do Supabase.

Mudanças futuras no schema deverão ocorrer por novas migrations versionadas. Alterações manuais no banco remoto devem ser evitadas para preservar rastreabilidade.

## 6. Qualidade e integração contínua

O repositório utiliza GitHub Actions com o workflow `CI`.

O job `Quality` executa:

- `npm ci`;
- validação do schema Prisma;
- geração do Prisma Client;
- testes automatizados;
- ESLint;
- build de produção;
- auditoria de dependências de produção com bloqueio para severidade crítica.

A branch `main` está protegida para exigir Pull Request e o check `Quality`, além de bloquear force-push e exclusão da branch.

O CI não utiliza credenciais reais de banco e não executa migrations remotas.

## 7. Restrições e decisões pendentes

Permanecem sem decisão ou implementação completa:

- autenticação;
- autorização associada à identidade autenticada;
- policies RLS da aplicação;
- hospedagem da aplicação;
- infraestrutura definitiva de execução;
- serviços externos adicionais;
- processamento de PDF;
- integrações condicionadas.

A camada de persistência também ainda deverá consolidar serviços/repositórios, seed controlado e testes de persistência antes da conclusão da Fase 3.

## 8. Princípios arquiteturais

- simplicidade adequada ao MVP;
- baixo acoplamento entre módulos;
- preparação multi-tenant sem declarar funcionalidades ainda inexistentes;
- separação entre domínio, interface e persistência;
- validação antes da persistência;
- isolamento explícito por organização;
- migrations versionadas como fonte de verdade do schema;
- TLS verificado;
- segredos fora do versionamento;
- mudanças em `main` validadas por CI;
- introdução de complexidade somente quando houver requisito real.

## 9. Estado do documento

A versão 0.3 atualiza a arquitetura para refletir a fundação de persistência implementada durante a Fase 3.

PostgreSQL gerenciado pelo Supabase e Prisma 7 passam a integrar a arquitetura oficial, conforme ADR-002.

A modelagem multi-tenant inicial, as migrations, constraints, RLS, testes de domínio, integração contínua e proteção da branch `main` passam a fazer parte do estado arquitetural conhecido.

Autenticação, autorização completa, policies de identidade, hospedagem e demais componentes futuros continuam pendentes de decisões e implementação próprias.
