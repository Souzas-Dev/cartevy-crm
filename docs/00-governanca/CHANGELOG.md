# Changelog Documental

**Documento:** GOV-003 — Changelog Documental
**Versão:** 0.3
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 24/09/2026

---

## 1. Finalidade

Este documento registra as mudanças relevantes na documentação controlada do projeto Cartevy CRM.

A finalidade é manter rastreabilidade sobre documentos aprovados, consolidações e reorganizações sem reconstruir histórico fictício.

## 2. Registros conhecidos

### 22/09/2026

- aprovação do GOV-001 v0.2;
- aprovação do PRD-001 v0.1;
- aprovação do PRD-002 v0.1;
- consolidação do PRD-003 como requisitos do produto;
- consolidação do PRD-004 como roadmap do produto;
- reorganização documental da estrutura do projeto;
- criação do índice documental e do changelog documental;
- alinhamento da documentação oficial aos documentos aprovados e ao estágio real do projeto;
- aprovação do GOV-001 v0.3, com correção do modelo oficial de cabeçalho;
- aprovação do GOV-002 v0.2, com atualização do índice documental;
- aprovação do PRD-002 v0.2, com correção de consistência documental;
- aprovação do PRD-003 v0.2, com complementação de requisitos e rastreabilidade;
- ajuste do README de decisões arquiteturais para uso como recurso auxiliar não controlado;
- manutenção do ARC-001 v0.1 no estado Em revisão;
- aprovação do GOV-001 v0.4, com inclusão da regra para atualizações operacionais do índice e do changelog sem incremento obrigatório de versão;
- aprovação do PRD-004 v0.2, com atualização do roadmap para registrar a Fase 1 — Estrutura técnica do projeto como em andamento e a fundação técnica inicial implementada e validada;
- criação e aprovação do ADR-001 v0.1, formalizando a fundação técnica inicial da aplicação;
- aprovação do ARC-001 v0.2, com atualização da arquitetura para refletir a fundação técnica implementada e as decisões ainda pendentes;
- aprovação do PRD-004 v0.3, com conclusão da Fase 1 — Estrutura técnica do projeto e início da Fase 2 — Fundação da aplicação;
- aprovação do PRD-004 v0.4, com registro do avanço da Fase 2 — Fundação da aplicação;
- aprovação do PRD-004 v0.5 e conclusão da Fase 2 — Fundação da aplicação;
- aprovação do PRD-004 v0.6 e adoção oficial da nomenclatura **Cartevy CRM**, com marca curta **Cartevy**, assinatura **by Souzas Dev** e slogan **“Sua carteira comercial em movimento”**, sem alteração do escopo funcional do produto.

### 23/09/2026

- criação e aprovação do ADR-002 v0.1, formalizando PostgreSQL gerenciado pelo Supabase, Prisma 7, estratégia de conexão, TLS e migrations da persistência;
- aprovação do ARC-001 v0.3, atualizando a arquitetura com a fundação de persistência, modelo multi-tenant inicial, RLS, migrations, domínio e integração contínua;
- aprovação do PRD-004 v0.7, registrando a Fase 3 — Persistência e domínio como em andamento e consolidando as entregas técnicas já concluídas;
- sincronização operacional do GOV-002 v0.2 para refletir PRD-004 v0.7, ARC-001 v0.3 e ADR-002 v0.1;
- sincronização operacional deste GOV-003 v0.2 conforme a regra da seção 9.1 do GOV-001.

#### Fechamento da Fase 3 — Persistência e domínio

- aprovação do PRD-002 v0.3;
- aprovação do PRD-003 v0.3;
- aprovação do PRD-004 v0.8;
- aprovação do ARC-001 v0.4;
- conclusão formal da Fase 3 — Persistência e domínio, com a Fase 4 — Autenticação como próxima etapa;
- revisão do modelo com base em pedidos reais e inclusão de `OrderItem`, com descrição/nome, quantidade decimal e unidade em texto aberto;
- suporte a pedidos sem cliente formal, válidos para indicadores de vendas, sem histórico de cliente ou follow-up, e preservação de `customerName` como snapshot no pedido;
- definição de `Customer.internalCode` como obrigatório e do código interno como identidade formal do `Customer`, com nome fora da estratégia automática de identidade;
- enriquecimento do cliente apenas em campos vazios, sem substituir valores existentes, e bloqueio de sobrescrita silenciosa de pedidos confirmados;
- consolidação da camada de persistência transacional, repositories, services, seed controlado e testes reais contra PostgreSQL/Supabase;
- registro de cinco migrations aplicadas: `20260923_initial_domain`, `20260923_harden_persistence`, `20260923_refine_crm_domain`, `20260923_support_unregistered_customer_orders` e `20260923_enforce_registered_customer_identity`; migrations aplicadas são imutáveis;
- confirmação do fluxo futuro de ingestão: pasta local → monitor Python → staging temporário → Telegram → validação → banco oficial PostgreSQL → Cartevy CRM; monitor, staging e Telegram estão aprovados para fases futuras e ainda não implementados;
- manutenção do RLS habilitado, com policies baseadas em identidade pendentes de autenticação/autorização, e da preparação multi-tenant como fronteira técnica futura, sem funcionalidade multiempresa disponível;
- atualização do README e aprovação do GOV-002 v0.3 e do GOV-003 v0.3 para consolidar o fechamento documental.

### 24/09/2026

#### Fechamento da Fase 4 — Autenticação

- conclusão formal da Fase 4 — Autenticação e definição da Fase 5 — Núcleo comercial como próxima etapa;
- aprovação do PRD-004 v0.9;
- aprovação do ARC-001 v0.5;
- criação e aprovação do ADR-003 v0.1 — Autenticação Própria da Aplicação;
- implementação de autenticação própria integrada a `AppUser`;
- adoção de credenciais com username, HMAC-SHA256, pepper server-side e Argon2id;
- implementação de sessões persistidas e revogáveis, com token bruto restrito ao servidor/cookie e persistência somente de seu hash;
- implementação de login, logout e proteção das áreas internas;
- implementação de `AuthContext` server-side com `appUserId` e `organizationId`;
- implementação de rate limiting persistente por username e, quando confiável, por IP;
- registro estruturado de eventos de segurança;
- bootstrap controlado do primeiro usuário e cleanup operacional;
- implementação de headers de segurança e Content Security Policy;
- aplicação e validação da migration `20260924_authentication_foundation`;
- validação real da persistência de autenticação contra PostgreSQL;
- manutenção do RLS sem policies baseadas diretamente na sessão do Cartevy, preservando autorização e isolamento explícitos na camada server-side;
- sincronização operacional do GOV-002 v0.3 e deste GOV-003 v0.3.

#### Início da Fase 5 — Núcleo comercial

- início formal da Fase 5 — Núcleo comercial;
- aprovação do PRD-004 v0.10;
- aprovação do ARC-001 v0.6;
- organização da Fase 5 nas subetapas 5.0 a 5.6;
- definição de gates internos para Clientes, Pedidos, Follow-ups, Encomendas, Dashboard e fechamento da fase;
- definição de `AuthContext` server-side como origem de `organizationId` e, quando aplicável, `appUserId` nas operações comerciais;
- manutenção do isolamento explícito por organização na camada server-side;
- preservação dos estados persistidos `PENDING` e `COMPLETED` para follow-ups, com situações operacionais derivadas pela regra de domínio;
- manutenção de `Order` como referência comercial das encomendas nesta etapa;
- manutenção de monitor Python, staging e Telegram fora da Fase 5;
- atualização do README para refletir o Núcleo comercial como em andamento;
- sincronização operacional do GOV-002 v0.3 e deste GOV-003 v0.3.
## 3. Estado do documento

Este changelog representa a linha de registro documental disponível para o projeto.

Novas mudanças relevantes devem ser incluídas aqui somente quando houver alteração documental efetiva, aprovada e rastreável.

A versão 0.3 permanece vigente. Em 24/09/2026, o documento recebeu atualização operacional adicional para registrar o início documentado da Fase 5 — Núcleo comercial, preservando o fechamento da Fase 4 e os registros históricos anteriores.
