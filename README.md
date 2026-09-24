# Cartevy CRM

**by Souzas Dev**

> Sua carteira comercial em movimento.

## Visão geral

O Cartevy CRM é uma aplicação web em desenvolvimento voltada ao acompanhamento comercial de clientes, pedidos, vendas, follow-ups e encomendas.

A proposta principal é centralizar informações da rotina comercial, preservar histórico e facilitar o acompanhamento de oportunidades sem substituir sistemas especializados em faturamento, estoque, logística ou gestão financeira.

## Estado atual

As **Fases 0, 1, 2, 3 e 4 estão concluídas**. A próxima etapa é a **Fase 5 — Núcleo comercial**.

Já estão concluídas:

- fundação documental;
- estrutura técnica do projeto;
- fundação navegável da aplicação;
- modelagem do domínio comercial revisada com base em pedidos reais;
- persistência PostgreSQL gerenciada pelo Supabase;
- integração com Prisma 7;
- seis migrations aplicadas e versionadas;
- RLS habilitado nas tabelas da aplicação e de autenticação;
- repositories, services e persistência transacional;
- validações e testes de domínio e persistência;
- seed controlado;
- autenticação própria server-side;
- credenciais com username;
- proteção de senha com Argon2id e pepper server-side;
- sessões persistidas e revogáveis;
- login e logout;
- proteção das áreas internas;
- contexto autenticado com usuário e organização;
- rate limiting persistente;
- eventos estruturados de segurança;
- bootstrap controlado do primeiro usuário;
- segurança HTTP e Content Security Policy;
- teste real de persistência da autenticação;
- CI com GitHub Actions;
- proteção da branch `main` com Pull Request e check `Quality` obrigatórios.

O núcleo comercial completo ainda não está implementado.

Monitor Python, staging e Telegram fazem parte do fluxo futuro aprovado e também ainda não estão implementados.

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
│   │   ├── lib/
│   │   └── server/
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
- GitHub Actions para integração contínua;
- autenticação própria server-side;
- Argon2id para proteção de senha;
- sessões persistidas no PostgreSQL;
- cookies seguros de sessão;
- Vitest para testes da camada de autenticação.

A autenticação própria está implementada e formalizada em `ADR-003 — Autenticação Própria da Aplicação`.

## Persistência e domínio

A modelagem atual contempla:

- Organization;
- AppUser;
- Customer;
- Order;
- OrderItem;
- FollowUp;
- Backorder.

A estrutura foi preparada para associação por organização desde a fundação, com chaves e relacionamentos compostos para reduzir o risco de referências entre organizações diferentes.

As regras atuais são:

- `Customer` representa cliente formalmente cadastrado; `Customer.internalCode` é obrigatório e o código interno é a identidade formal usada para reutilização. Nome não é chave automática de identidade;
- `Order` pode existir sem `Customer`: pedido sem código interno continua sendo venda válida para indicadores, mas não gera histórico de cliente ou follow-up;
- `customerName` é preservado como snapshot do nome apresentado na origem do pedido;
- dados de origem podem preencher campos vazios do cliente, mas não sobrescrever valores existentes;
- pedido confirmado não é sobrescrito silenciosamente;
- `OrderItem` contém, como dados comerciais, descrição/nome, quantidade e unidade; quantidade pode ser decimal e unidade é texto aberto.

A camada server-side usa repositories e services. A persistência de pedido confirmado é transacional: verifica duplicidade, resolve ou cria cliente quando aplicável, cria o pedido e seus itens e retorna o agregado persistido.

Existem exatamente seis migrations aplicadas:

1. `20260923_initial_domain`;
2. `20260923_harden_persistence`;
3. `20260923_refine_crm_domain`;
4. `20260923_support_unregistered_customer_orders`;
5. `20260923_enforce_registered_customer_identity`;
6. `20260924_authentication_foundation`.

Migrations aplicadas são imutáveis; alterações futuras devem ocorrer por novas migrations versionadas.

RLS está habilitado nas tabelas da aplicação e nas tabelas específicas de autenticação.

Não existem policies baseadas diretamente na sessão do Cartevy. A aplicação utiliza autorização server-side e as operações comerciais deverão respeitar explicitamente o `organizationId` derivado do contexto autenticado.

O fluxo futuro aprovado de ingestão é:

`pasta local → monitor Python → staging temporário → Telegram → validação → PostgreSQL oficial → Cartevy CRM`.

Esse fluxo está planejado e aprovado, mas ainda não implementado. O monitor não escreve diretamente nas tabelas oficiais; somente pedidos validados entram no histórico oficial.

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
- [ADR-003 — Autenticação Própria da Aplicação](docs/02-arquitetura/decisoes/AUTENTICACAO-PROPRIA.md)

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
| Persistência e domínio | Concluída |
| Autenticação | Concluída |
| Núcleo comercial | Próxima |
| Importação de PDFs | Planejada |
| Monitor local / extração | Planejado |
| Staging temporário | Planejado |
| Telegram / validação | Planejado |
| Deploy e estabilização | Não iniciado |

## Observação

Funcionalidades e capacidades devem ser tratadas conforme seu estado real de implementação.

A preparação multi-tenant é uma fronteira técnica para evolução futura; não existe funcionalidade multiempresa disponível no MVP atual.

A autenticação própria está implementada, mas não inclui administração completa de múltiplos usuários ou diferentes níveis de acesso.

RLS não substitui a autorização server-side. As operações da Fase 5 deverão utilizar a identidade e o `organizationId` provenientes do contexto autenticado. Policies baseadas diretamente na sessão do Cartevy permanecem como possível evolução futura.
