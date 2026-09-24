# Arquitetura da Aplicação

**Documento:** ARC-001 — Arquitetura da Aplicação
**Versão:** 0.6
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 24/09/2026

---

## 1. Finalidade

Este documento registra a visão arquitetural atualmente sustentada pelo projeto Cartevy CRM.

Ele não pretende estabelecer uma arquitetura definitiva para todos os cenários futuros, mas preservar as direções conhecidas, as decisões formalizadas e os limites atuais da aplicação.

## 2. Direção atual

A aplicação principal permanece estruturada como uma única aplicação Next.js, com frontend e capacidades de servidor convivendo na mesma base enquanto não houver requisito concreto que justifique separação adicional.

A fundação técnica está formalizada em `ADR-001 — Fundação Técnica Inicial da Aplicação`.

A persistência está formalizada em `ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase`.

A autenticação está formalizada em `ADR-003 — Autenticação Própria da Aplicação`.

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
- autenticação própria server-side;
- sessões persistidas no PostgreSQL;
- Argon2id com pepper server-side;
- cookies seguros de sessão;
- rate limiting persistente;
- contexto autenticado por usuário e organização;
- GitHub Actions para integração contínua.

Hospedagem da aplicação e infraestrutura definitiva de execução permanecem pendentes.

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

A Fase 3 — Persistência e domínio está concluída. A camada server-side contém repositories e services para operações de persistência controladas, com testes de persistência.

### 4.3 Persistência

A persistência utiliza PostgreSQL gerenciado pelo Supabase, Prisma 7 e `@prisma/adapter-pg`.

O Prisma atua como:

- definição versionada do schema;
- cliente de acesso ao banco;
- mecanismo de migrations da aplicação.

A aplicação usa duas formas de conexão:

- `DATABASE_URL` para runtime por Supavisor Transaction Pooler;
- `DIRECT_URL` para Prisma CLI e migrations por Supavisor Session Pooler.

A verificação TLS utiliza a CA oficial do Supabase com validação de certificado habilitada por `rejectUnauthorized: true`.

O histórico de migrations da aplicação é mantido pelo Prisma em `public._prisma_migrations`. O histórico próprio do Supabase CLI não é utilizado como fonte de verdade para as migrations do schema da aplicação.

A persistência de pedido confirmado ocorre em uma transação:

1. verifica duplicidade;
2. resolve ou cria o cliente quando aplicável;
3. cria `Order`;
4. cria os registros de `OrderItem`;
5. retorna o agregado persistido.

### 4.4 Modelo de domínio

A modelagem atual contém:

- `Organization`;
- `AppUser`;
- `Customer`;
- `Order`;
- `OrderItem`;
- `FollowUp`;
- `Backorder`.

Todas as entidades comerciais carregam associação com organização.

Relacionamentos sensíveis utilizam foreign keys compostas que incluem `organizationId`, reduzindo a possibilidade de relacionar registros pertencentes a organizações diferentes.

Essa proteção relacional não substitui autorização server-side nem filtros por organização nas consultas.

`Customer` representa somente cliente formalmente cadastrado. `Customer.internalCode` é obrigatório: o código interno da operação é a identidade formal do cliente. Nome não é usado como chave automática de identidade.

`Order` pode existir sem `Customer`, pois `Order.customerId` é opcional. Todo `Order` preserva `customerName` como snapshot do nome apresentado na origem.

Venda sem código interno:

- não cria `Customer`;
- continua sendo `Order` e participa dos indicadores de vendas;
- não cria histórico de cliente;
- não participa do fluxo de follow-up.

Venda com código interno:

- pode criar ou reutilizar `Customer`;
- fica vinculada ao histórico comercial;
- torna-se elegível ao fluxo de follow-up, cuja geração automática ainda é futura.

Campos recebidos da origem podem completar campos vazios do cliente, mas nunca substituir silenciosamente valores existentes. WhatsApp e observações podem ser atualizados manualmente. Nome, código interno e documento não devem ser alterados manualmente no fluxo normal.

Quanto aos dados comerciais do item, `OrderItem` persiste somente descrição/nome, quantidade e unidade de medida. Quantidade suporta decimal e unidade é texto aberto, sem enum rígido.

A preparação multi-tenant atual é apenas uma fronteira técnica para evolução futura. Não existe funcionalidade multiempresa disponível no MVP atual.

### 4.5 Integridade e RLS

A integridade atual combina:

- constraints do schema relacional;
- índices;
- checks no PostgreSQL;
- foreign keys compostas;
- escopo por `organizationId`;
- validação Zod antes da persistência;
- transações;
- RLS habilitado nas tabelas públicas da aplicação.

RLS está habilitado em:

- `organizations`;
- `app_users`;
- `customers`;
- `orders`;
- `order_items`;
- `follow_ups`;
- `backorders`;
- `_prisma_migrations`.

Ainda não existem policies de acesso baseadas diretamente na identidade da sessão do Cartevy.

A autenticação própria não transforma a sessão da aplicação em identidade da Data API do Supabase.

O acesso Prisma utiliza credencial de servidor com capacidade privilegiada. Portanto, RLS não substitui o isolamento e a autorização server-side.

As operações comerciais deverão utilizar explicitamente o `organizationId` derivado do `AuthContext`.

Eventual adoção futura de policies baseadas em identidade exigirá mecanismo compatível e decisão arquitetural própria.

### 4.6 Autenticação e identidade

A autenticação própria está implementada na camada server-side e formalizada em `ADR-003 — Autenticação Própria da Aplicação`.

A identidade utiliza:

- `AppUser` como usuário da aplicação;
- `AuthCredential` como credencial própria;
- username canônico para login;
- senha protegida por HMAC-SHA256 e Argon2id;
- sessões persistidas no PostgreSQL;
- token bruto restrito ao servidor e ao cookie;
- persistência somente do hash do token;
- cookies `HttpOnly`, `SameSite=Strict` e `Secure` fora de desenvolvimento;
- rate limiting persistente;
- eventos estruturados de segurança.

O contexto autenticado server-side fornece:

- `sessionId`;
- `appUserId`;
- `organizationId`;
- `name`.

A organização é derivada do `AppUser` persistido e não de parâmetros fornecidos pelo cliente.

As áreas internas exigem contexto autenticado.

Essa proteção de rota não substitui autorização nas operações de dados. Services, Server Actions e consultas comerciais deverão utilizar explicitamente o `organizationId` proveniente do contexto autenticado.

A implementação atual não inclui administração completa de múltiplos usuários, níveis de permissão, recuperação automática de senha, MFA ou policies RLS baseadas diretamente na sessão do Cartevy.

### 4.7 Automação externa

O fluxo aprovado para fases futuras é:

```text
Pasta local
↓
Monitor Python
↓
Staging temporário / dados estruturados temporários
↓
Telegram
↓
validação
↓
PostgreSQL oficial
↓
Cartevy CRM
```

Monitor Python, staging e Telegram são direção aprovada para fases futuras e ainda não estão implementados.

As regras desse fluxo são:

- o monitor Python não escreve diretamente nas tabelas oficiais;
- dados em staging ainda não fazem parte do histórico oficial;
- o staging precisa sobreviver à reinicialização do computador;
- antes da confirmação, a versão mais recente do mesmo pedido pode substituir a preparação temporária anterior;
- somente pedidos validados pelo fluxo entram no banco oficial;
- pedido já confirmado nunca deve ser sobrescrito silenciosamente;
- o mecanismo definitivo de staging, autenticação e transporte ainda será definido;
- deve ser aplicado o princípio de menor privilégio;
- não deve ser colocada chave poderosa, como service-role, no computador da loja.

### 4.8 PDF e dados estruturados

O arquivo PDF não é considerado repositório definitivo do sistema.

O PDF é fonte de extração, e não é necessário persistir permanentemente o arquivo.

A prioridade é validar e persistir dados estruturados extraídos, prevenindo duplicidade e evitando transformar o CRM em armazenamento documental permanente.

Os dados relevantes definidos atualmente são:

- número do pedido;
- nome apresentado;
- código interno, quando houver;
- CPF/CNPJ, quando houver;
- WhatsApp, quando houver;
- total de produtos;
- desconto total;
- frete;
- total geral;
- itens com descrição, quantidade e unidade.

Não integram os dados a persistir da extração: pagamento, endereço, e-mail, telefone convencional, códigos/referências de produtos, preço unitário, peso, seguro e demais campos sem utilidade atual ao CRM.

## 5. Migrations e estado do banco

A persistência possui seis migrations aplicadas e versionadas:

1. `20260923_initial_domain`;
2. `20260923_harden_persistence`;
3. `20260923_refine_crm_domain`;
4. `20260923_support_unregistered_customer_orders`;
5. `20260923_enforce_registered_customer_identity`;
6. `20260924_authentication_foundation`.

As cinco primeiras consolidam a fundação do domínio comercial e sua integridade.

A migration `20260924_authentication_foundation` acrescenta:

- credenciais próprias;
- sessões;
- buckets persistentes de rate limit;
- eventos de segurança;
- constraints e índices de autenticação;
- foreign keys;
- RLS nas tabelas de autenticação.

Ela também remove a referência legada `auth_user_id` de `app_users` e torna o e-mail cadastral opcional.

As seis migrations foram aplicadas e validadas contra o PostgreSQL utilizado pelo projeto.

Migrations já aplicadas são imutáveis. Mudanças futuras no schema deverão ocorrer por novas migrations versionadas. Alterações manuais no banco remoto devem ser evitadas para preservar rastreabilidade.

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

Após a conclusão da Fase 4, permanecem pendentes de definição ou implementação:

- autorização específica de cada operação comercial;
- policies RLS baseadas diretamente na sessão do Cartevy;
- administração completa de múltiplos usuários;
- diferentes níveis de permissão;
- recuperação automática de senha;
- MFA;
- CRUD comercial completo;
- geração automática de follow-up;
- definição da cadência dos follow-ups;
- monitor Python;
- staging definitivo;
- bot Telegram;
- hospedagem da aplicação;
- infraestrutura definitiva de execução;
- serviços externos adicionais;
- processamento de PDF;
- integrações condicionadas;
- deploy/estabilização de produção.

A Fase 5 — Núcleo comercial está em andamento.

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

A versão 0.6 representa a arquitetura no início da Fase 5 — Núcleo comercial, preservando como concluída a base estabelecida até a Fase 4 — Autenticação.

PostgreSQL gerenciado pelo Supabase e Prisma 7 permanecem como fundação de persistência conforme ADR-002.

A autenticação própria passa a integrar a arquitetura oficial conforme ADR-003.

O estado arquitetural conhecido inclui:

- domínio comercial persistido;
- seis migrations aplicadas;
- constraints e RLS;
- repositories e services;
- persistência transacional;
- autenticação própria server-side;
- credenciais protegidas com Argon2id e pepper;
- sessões persistidas e revogáveis;
- cookies seguros;
- rate limiting persistente;
- eventos de segurança;
- contexto autenticado contendo `appUserId` e `organizationId`;
- proteção das áreas internas;
- integração contínua;
- proteção da branch `main`.

A autorização específica das operações comerciais deverá ser aplicada na Fase 5 utilizando a identidade e a organização provenientes do contexto autenticado.

Policies RLS baseadas diretamente na sessão do Cartevy, administração completa de usuários, hospedagem e infraestrutura definitiva permanecem pendentes de decisões ou implementação próprias.

A Fase 5 — Núcleo comercial está em andamento.

O fluxo de ingestão com monitor Python, staging temporário e Telegram permanece como direção aprovada para fases futuras.
