# Fundação Técnica Inicial da Aplicação

**Documento:** ADR-001 — Fundação Técnica Inicial da Aplicação
**Versão:** 0.1
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

---

## 1. Contexto

O CRM de Vendas necessita de uma base técnica simples, sustentável e adequada ao estágio inicial do produto.

A arquitetura registrada em `ARC-001 — Arquitetura da Aplicação` prevê uma aplicação web orientada ao MVP, com possibilidade de concentrar inicialmente frontend e backend em uma mesma base, evitando complexidade arquitetural prematura.

A fundação técnica inicial já foi implementada e validada com lint e build de produção executados com sucesso.

## 2. Decisão

A aplicação principal será desenvolvida inicialmente como uma aplicação Next.js com App Router, utilizando React e TypeScript.

A base técnica adotada nesta etapa é composta por:

- Next.js como framework principal da aplicação web;
- React como biblioteca de interface;
- TypeScript como linguagem principal da aplicação;
- App Router como modelo de roteamento e organização da aplicação;
- Tailwind CSS com PostCSS para a base de estilização;
- ESLint com configuração compatível com Next.js para análise estática;
- npm para gerenciamento de dependências e lockfile;
- uma única base inicial de aplicação, localizada no diretório `app`, concentrando as capacidades web necessárias ao MVP.

As versões inicialmente estabelecidas na implementação são:

- Next.js 16.3.6;
- React 19.3.0;
- TypeScript 6.0.3;
- Tailwind CSS 4.3.3;
- ESLint 9.39.5;
- npm 11.17.0.

Esta decisão não formaliza banco de dados, autenticação, hospedagem ou infraestrutura definitiva. Essas escolhas permanecem pendentes de decisão arquitetural própria.

## 3. Justificativa

A abordagem adotada reduz a quantidade de componentes independentes necessários no início do projeto e mantém a implementação alinhada ao escopo do MVP.

O uso de uma base única com Next.js e TypeScript permite evoluir interface, regras de aplicação e capacidades de servidor sem introduzir antecipadamente separações arquiteturais que ainda não foram justificadas pelas necessidades reais do produto.

A escolha também preserva a possibilidade de componentes auxiliares utilizarem outras tecnologias, como Python, quando houver necessidade aprovada para processamento de PDF ou automações externas.

## 4. Impactos

### 4.1 Impactos positivos

- menor complexidade operacional na fase inicial;
- base tecnológica única para a aplicação principal;
- tipagem estática com TypeScript;
- estrutura compatível com evolução incremental do MVP;
- redução de decisões de infraestrutura prematuras;
- possibilidade de introduzir integrações e componentes externos de forma controlada.

### 4.2 Limitações e compromissos

- a aplicação passa a possuir dependência arquitetural relevante do ecossistema Next.js;
- mudanças futuras de framework poderão exigir migração significativa;
- a concentração inicial da aplicação deverá ser revista caso requisitos reais justifiquem separação de serviços;
- banco de dados, autenticação, hospedagem e infraestrutura continuam sem fornecedor ou solução formalmente definidos.

## 5. Alternativas não adotadas nesta etapa

Não foram adotadas nesta etapa:

- separação imediata entre frontend e backend em aplicações independentes;
- arquitetura baseada em microsserviços;
- uso de Python como tecnologia principal da aplicação web;
- definição antecipada de fornecedores de banco de dados, autenticação ou hospedagem.

Essas alternativas poderão ser reavaliadas caso requisitos futuros forneçam justificativa técnica suficiente.

## 6. Relação com outros documentos

Esta decisão complementa:

- `ARC-001 — Arquitetura da Aplicação`;
- `PRD-002 — Escopo do MVP`;
- `PRD-003 — Requisitos do Produto`;
- `PRD-004 — Roadmap do Produto`.

## 7. Estado da decisão

A decisão está aprovada e passa a constituir referência arquitetural oficial do projeto.

A fundação técnica descrita possui implementação inicial validada e permanece sujeita à evolução controlada conforme `GOV-001 — Padrão de Documentação`.
