# Índice Documental

**Documento:** GOV-002 — Índice Documental
**Versão:** 0.3
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 24/09/2026

---

## 1. Finalidade

Este documento atua como mapa oficial da documentação do projeto Cartevy CRM.

Sua finalidade é facilitar a localização de documentos controlados e manter a estrutura documental alinhada ao estado real do projeto.

## 2. Governança

- **GOV-001 — Padrão de Documentação**
  Arquivo: [PADRAO-DOCUMENTACAO.md](PADRAO-DOCUMENTACAO.md)
  Versão: 0.4
  Status: Aprovado
  Finalidade: definir o padrão documental oficial do projeto.

- **GOV-002 — Índice Documental**
  Arquivo: [INDICE.md](INDICE.md)
  Versão: 0.3
  Status: Aprovado
  Finalidade: mapear a documentação controlada do projeto.

- **GOV-003 — Changelog Documental**
  Arquivo: [CHANGELOG.md](CHANGELOG.md)
  Versão: 0.3
  Status: Aprovado
  Finalidade: registrar mudanças relevantes na documentação controlada.

## 3. Produto

- **PRD-001 — Visão do Produto**
  Arquivo: [../01-produto/VISAO-PRODUTO.md](../01-produto/VISAO-PRODUTO.md)
  Versão: 0.1
  Status: Aprovado
  Finalidade: apresentar a visão, contexto, limites e direção de evolução do produto.

- **PRD-002 — Escopo do MVP**
  Arquivo: [../01-produto/ESCOPO-MVP.md](../01-produto/ESCOPO-MVP.md)
  Versão: 0.3
  Status: Aprovado
  Finalidade: definir o escopo da primeira entrega e os limites do MVP.

- **PRD-003 — Requisitos do Produto**
  Arquivo: [../01-produto/REQUISITOS.md](../01-produto/REQUISITOS.md)
  Versão: 0.3
  Status: Aprovado
  Finalidade: consolidar requisitos funcionais, regras de negócio e condicionamentos do produto.

- **PRD-004 — Roadmap do Produto**
  Arquivo: [../01-produto/ROADMAP.md](../01-produto/ROADMAP.md)
  Versão: 0.9
  Status: Aprovado
  Finalidade: organizar as fases de evolução do projeto e sua progressão.

## 4. Arquitetura

- **ARC-001 — Arquitetura da Aplicação**
  Arquivo: [../02-arquitetura/ARQUITETURA.md](../02-arquitetura/ARQUITETURA.md)
  Versão: 0.5
  Status: Aprovado
  Finalidade: registrar as decisões arquiteturais conhecidas e sustentadas pelo projeto.

- **ADR-001 — Fundação Técnica Inicial da Aplicação**
  Arquivo: [../02-arquitetura/decisoes/FUNDACAO-TECNICA-INICIAL.md](../02-arquitetura/decisoes/FUNDACAO-TECNICA-INICIAL.md)
  Versão: 0.1
  Status: Aprovado
  Finalidade: registrar a decisão sobre a fundação técnica inicial da aplicação.

- **ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase**
  Arquivo: [../02-arquitetura/decisoes/PERSISTENCIA-POSTGRESQL-SUPABASE.md](../02-arquitetura/decisoes/PERSISTENCIA-POSTGRESQL-SUPABASE.md)
  Versão: 0.1
  Status: Aprovado
  Finalidade: formalizar PostgreSQL/Supabase, Prisma 7 e a estratégia de migrations da persistência.

- **ADR-003 — Autenticação Própria da Aplicação**
  Arquivo: [../02-arquitetura/decisoes/AUTENTICACAO-PROPRIA.md](../02-arquitetura/decisoes/AUTENTICACAO-PROPRIA.md)
  Versão: 0.1
  Status: Aprovado
  Finalidade: formalizar autenticação própria, credenciais, sessões, rate limiting e contexto autenticado.

### Recurso auxiliar

- [Convenção para decisões de arquitetura](../02-arquitetura/decisoes/README.md) — orienta o uso futuro de ADRs. Este README não é um documento controlado e não recebe código, versão ou status documental.

## 5. Documentação prevista

Os seguintes domínios e documentos ainda não foram criados como documentação oficial do projeto:

- Interface: 03-interface
- Integrações: 04-integracoes
- Deploy: 05-deploy
- Operação: 06-operacao

Esses itens permanecem previstos na estrutura documental e não devem ser tratados como documentos existentes até que sejam efetivamente criados.

## 6. Estado do documento

Este índice reflete a documentação controlada vigente do Cartevy CRM.

A versão 0.3 permanece vigente. Em 24/09/2026, o índice foi sincronizado operacionalmente para refletir PRD-004 v0.9, ARC-001 v0.5 e ADR-003 v0.1 no fechamento documental da Fase 4 — Autenticação.
