# Cartevy CRM

**by Souzas Dev**

> Sua carteira comercial em movimento.

## Visão geral

O Cartevy CRM é uma aplicação web em desenvolvimento voltada ao acompanhamento comercial de clientes, pedidos, vendas, follow-ups e encomendas.

A proposta principal é centralizar informações da rotina comercial, preservar histórico e facilitar o acompanhamento de oportunidades sem substituir sistemas especializados em faturamento, estoque, logística ou gestão financeira.

## Estado atual

O projeto está na **Fase 3 — Persistência e domínio**, em andamento.

Já estão concluídas:

- fundação documental;
- estrutura técnica do projeto;
- fundação navegável da aplicação;
- modelagem inicial do domínio comercial;
- persistência PostgreSQL gerenciada pelo Supabase;
- integração com Prisma 7;
- migrations iniciais e hardening do banco;
- RLS habilitado nas tabelas da aplicação;
- validações e testes iniciais de domínio;
- CI com GitHub Actions;
- proteção da branch `main` com Pull Request e check `Quality` obrigatórios.

A Fase 3 ainda não está concluída. Permanecem para esta etapa a consolidação da camada de persistência do domínio, serviços/repositórios, seed controlado e testes de persistência antes da entrada no núcleo comercial.

## Escopo resumido

O foco do produto é apoiar a rotina comercial com:

- clientes;
- pedidos;
- vendas;
- histórico comercial;
- follow-ups;
- encomendas;
- busca e consulta;
- indicadores comerciais;
- importação de dados de pedidos por PDF.

O Cartevy CRM não é um ERP e não cobre faturamento, estoque, logística, financeiro ou gestão de fornecedores como módulos centrais.

## Estrutura principal

```text
cartevy-crm/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
│   ├── prisma/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── domain/
│   │   └── lib/
│   └── ...
├── docs/
│   ├── 00-governanca/
│   ├── 01-produto/
│   └── 02-arquitetura/
│       └── decisoes/
└── supabase/
```

## Fundação técnica atual

A aplicação principal utiliza:

- Next.js 16.3.6;
- React 19.3.0;
- TypeScript 6.0.3;
- Tailwind CSS 4.3.3;
- PostgreSQL gerenciado pelo Supabase;
- Prisma 7.10.0;
- `@prisma/adapter-pg`;
- Zod para validação de entrada;
- Vitest para testes;
- GitHub Actions para integração contínua.

A autenticação ainda não faz parte da implementação atual e permanece planejada para a Fase 4.

## Persistência e domínio

A modelagem inicial contempla:

- Organization;
- AppUser;
- Customer;
- Order;
- FollowUp;
- Backorder.

A estrutura foi preparada para associação por organização desde a fundação, com chaves e relacionamentos compostos para reduzir o risco de referências entre organizações diferentes.

RLS está habilitado nas tabelas da aplicação, mas policies de acesso ainda não foram criadas. Essa decisão é intencional até que autenticação e autorização sejam implementadas na Fase 4.

## Qualidade e fluxo de contribuição

O workflow `CI` executa, entre outros gates:

- instalação reproduzível com `npm ci`;
- validação e geração do Prisma Client;
- testes automatizados;
- ESLint;
- build de produção;
- auditoria de dependências de produção com bloqueio para vulnerabilidades críticas.

A branch `main` é protegida. O fluxo esperado é:

`branch de trabalho → Pull Request → Quality verde → squash merge → main`.

## Documentação

- [Padrão de Documentação](docs/00-governanca/PADRAO-DOCUMENTACAO.md)
- [Índice Documental](docs/00-governanca/INDICE.md)
- [Changelog Documental](docs/00-governanca/CHANGELOG.md)
- [Visão do Produto](docs/01-produto/VISAO-PRODUTO.md)
- [Escopo do MVP](docs/01-produto/ESCOPO-MVP.md)
- [Requisitos do Produto](docs/01-produto/REQUISITOS.md)
- [Roadmap do Produto](docs/01-produto/ROADMAP.md)
- [Arquitetura da Aplicação](docs/02-arquitetura/ARQUITETURA.md)
- [ADR-001 — Fundação Técnica Inicial da Aplicação](docs/02-arquitetura/decisoes/FUNDACAO-TECNICA-INICIAL.md)
- [ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase](docs/02-arquitetura/decisoes/PERSISTENCIA-POSTGRESQL-SUPABASE.md)

## Princípios

- simplicidade operacional;
- baixo atrito para o usuário;
- documentação contínua;
- evolução incremental;
- controle de escopo;
- preparação para expansão futura sem complexidade prematura;
- proteção de dados e redução de riscos operacionais.

## Estado das funcionalidades

| Área | Estado |
|---|---|
| Fundação documental | Concluída |
| Estrutura técnica do projeto | Concluída |
| Fundação da aplicação | Concluída |
| Persistência e domínio | Em andamento |
| Autenticação | Não iniciada |
| Núcleo comercial | Não iniciado |
| Importação de PDFs | Planejada |
| Telegram | Condicionado |
| Monitor local | Condicionado |
| Deploy | Não iniciado |

## Observação

Funcionalidades e capacidades devem ser tratadas conforme seu estado real de implementação.

A preparação multi-tenant existente na modelagem não substitui autenticação, autorização nem filtros server-side por organização. Esses controles serão implementados e validados nas fases correspondentes.
