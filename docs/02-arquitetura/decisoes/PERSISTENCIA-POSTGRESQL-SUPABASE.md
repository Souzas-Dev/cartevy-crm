# Persistência PostgreSQL Gerenciada pelo Supabase

**Documento:** ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase
**Versão:** 0.1
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 23/09/2026

---

## 1. Contexto

A Fase 3 do Cartevy CRM exige uma camada de persistência relacional capaz de sustentar clientes, pedidos, follow-ups, encomendas, responsáveis e organizações com integridade e evolução controlada do schema.

A decisão precisa permanecer compatível com a fundação Next.js e TypeScript definida em ADR-001, reduzir complexidade operacional no estágio atual e preparar o produto para separação lógica por organização.

Também é necessário preservar uma trilha reproduzível de migrations, validar conexões TLS e manter segredos fora do repositório.

## 2. Decisão

A persistência principal do Cartevy CRM utilizará PostgreSQL gerenciado pelo Supabase.

O Prisma 7 será utilizado como camada de schema, migrations e acesso ao banco na aplicação.

A integração utiliza:

- `prisma/schema.prisma` como definição versionada do modelo;
- Prisma Client 7;
- `@prisma/adapter-pg`;
- driver `pg`;
- `DATABASE_URL` para runtime;
- `DIRECT_URL` para Prisma CLI e migrations;
- Supavisor Transaction Pooler na porta 6543 para runtime;
- Supavisor Session Pooler na porta 5432 para migrations e operações persistentes do Prisma CLI;
- validação TLS explícita com a CA oficial do Supabase;
- migrations versionadas em `app/prisma/migrations`.

O Prisma, e não o histórico de migrations do Supabase CLI, será a fonte de verdade para a evolução do schema da aplicação.

## 3. Modelo inicial

A fundação de persistência inclui:

- Organization;
- AppUser;
- Customer;
- Order;
- FollowUp;
- Backorder.

As entidades comerciais carregam `organizationId`.

Foreign keys compostas são utilizadas em relações que precisam garantir coerência entre a entidade referenciada e sua organização.

Essa modelagem prepara o produto para isolamento multi-tenant, mas não representa autorização completa por si só.

## 4. Integridade

A estratégia de integridade combina:

- tipos e constraints do PostgreSQL;
- índices;
- unicidades por organização;
- foreign keys;
- foreign keys compostas;
- checks adicionais para documento, telefone, valores monetários e consistência de conclusão de follow-ups;
- validações de domínio com Zod antes da persistência;
- invariantes server-side.

O campo de telefone não é único por organização, pois telefones compartilhados podem existir.

## 5. Row Level Security

RLS é habilitado desde a fundação nas tabelas da aplicação.

A tabela `public._prisma_migrations` também possui RLS habilitado para evitar exposição indevida pela Data API.

Nesta etapa não são criadas policies para `anon` ou `authenticated`.

Essa ausência é intencional enquanto autenticação e autorização não estiverem formalizadas na Fase 4.

O acesso Prisma da aplicação utiliza credencial de servidor com capacidade de contornar RLS. Portanto:

- RLS não deve ser tratado como substituto de autorização server-side;
- toda operação de aplicação deverá respeitar explicitamente a organização ativa;
- testes de isolamento por organização deverão fazer parte da consolidação da camada de persistência;
- policies baseadas em identidade deverão ser definidas somente quando o modelo de autenticação estiver aprovado.

## 6. Migrations

As migrations iniciais aprovadas são:

- `20260923_initial_domain`;
- `20260923_harden_persistence`.

A migration inicial cria o domínio relacional, constraints, índices básicos e RLS das tabelas de aplicação.

A migration de hardening:

- habilita RLS em `_prisma_migrations`;
- adiciona índices de cobertura para foreign keys compostas identificadas pelos advisors do Supabase.

Novas alterações do schema deverão ser registradas por migrations adicionais. Migrations já aplicadas não devem ser reescritas.

## 7. Segurança de conexão

A conexão ao PostgreSQL deverá verificar o certificado TLS.

Não é permitido resolver problemas de conexão por desabilitação de validação, como `rejectUnauthorized: false`.

A CA utilizada pelo runtime é mantida como certificado público do provedor e não contém segredo.

Credenciais e URLs reais de banco permanecem fora do Git, em arquivos e variáveis de ambiente apropriados.

## 8. Justificativa

A decisão foi adotada porque:

- PostgreSQL é adequado ao modelo relacional do CRM;
- o Supabase reduz a necessidade de administrar diretamente o servidor PostgreSQL;
- o projeto pode utilizar poolers compatíveis com o ambiente atual;
- Prisma integra schema, migrations e acesso tipado em TypeScript;
- a solução permite evolução incremental sem separar prematuramente um backend independente;
- constraints relacionais ajudam a sustentar integridade e preparação multi-tenant desde a fundação.

## 9. Impactos

### 9.1 Impactos positivos

- persistência relacional gerenciada;
- schema versionado;
- migrations reproduzíveis;
- acesso tipado pelo Prisma;
- integridade reforçada no banco e no domínio;
- preparação explícita por organização;
- possibilidade de evolução posterior de autenticação e RLS sem refazer o modelo central.

### 9.2 Limitações e compromissos

- existe dependência de PostgreSQL e do ecossistema Prisma;
- a operação atual depende da disponibilidade do Supabase e do Supavisor;
- uso incorreto de credenciais server-side pode contornar RLS;
- isolamento multi-tenant ainda depende de regras server-side e testes;
- autenticação e policies por identidade permanecem pendentes;
- a estratégia de hospedagem da aplicação não é definida por esta decisão.

## 10. Alternativas não adotadas nesta etapa

Não foram adotados como persistência principal:

- banco local SQLite;
- banco PostgreSQL administrado manualmente em VPS;
- banco NoSQL como modelo primário;
- uso direto da Data API do Supabase como camada principal de acesso;
- migrations do Supabase CLI como fonte de verdade do schema da aplicação;
- separação imediata de um backend independente apenas para acesso ao banco.

Essas alternativas poderão ser reavaliadas caso requisitos futuros justifiquem a mudança.

## 11. Relação com outros documentos

Esta decisão complementa:

- `ARC-001 — Arquitetura da Aplicação`;
- `ADR-001 — Fundação Técnica Inicial da Aplicação`;
- `PRD-002 — Escopo do MVP`;
- `PRD-003 — Requisitos do Produto`;
- `PRD-004 — Roadmap do Produto`.

## 12. Estado da decisão

A decisão está aprovada e corresponde à implementação aplicada no projeto.

A persistência PostgreSQL/Supabase e o Prisma 7 constituem a fundação oficial de dados da Fase 3, sujeita à evolução controlada por novas migrations e pelas regras de governança documental.
