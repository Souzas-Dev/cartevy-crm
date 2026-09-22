# Arquitetura da Aplicação

**Documento:** ARC-001 — Arquitetura da Aplicação
**Versão:** 0.1
**Status:** Em revisão
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

---

## 1. Finalidade

Este documento registra a visão arquitetural atualmente sustentada pelo projeto CRM de Vendas.

Ele não pretende estabelecer uma arquitetura definitiva para todos os cenários futuros, mas sim preservar as direções conhecidas e aceitáveis para a primeira fase do produto.

## 2. Direção atual

A aplicação principal é concebida como uma solução web, inicialmente simples e orientada ao MVP.

As direções conhecidas são:

- aplicação web como principal interface do usuário;
- arquitetura inicialmente simples e focada em produto mínimo viável;
- aplicação principal podendo concentrar frontend e backend em uma mesma base inicial;
- automações externas comunicando-se com a aplicação por interfaces controladas;
- componentes de automação podendo utilizar Python;
- evolução futura sem complexidade desnecessária;
- manutenção da clareza entre domínio comercial, integrações e infraestrutura.

## 3. Escopo arquitetural

A arquitetura deve apoiar:

- cadastro e consulta de clientes;
- registro e acompanhamento de pedidos;
- histórico comercial;
- follow-ups;
- encomendas;
- indicadores e consultas comerciais;
- importação de pedidos a partir de PDF;
- evolução para múltiplos usuários e organizações no futuro.

A arquitetura não deve ampliar o escopo da solução para áreas que não fazem parte do objetivo central do produto, como faturamento, estoque, logística e gestão financeira.

## 4. Estrutura conceitual

### 4.1 Aplicação principal

A aplicação principal deve concentrar o núcleo do CRM, incluindo:

- interface de usuário;
- regras de negócio;
- persistência de dados estruturados;
- autenticação básica;
- consultas e filtros comerciais;
- integração com fluxos de importação e automação.

### 4.2 Automação externa

Componentes externos, quando aprovados, podem interagir com a aplicação principal por meio de interfaces controladas, sem exigir que o CRM se transforme em um sistema de automação geral.

A linguagem Python pode ser usada para processamentos auxiliares, como leitura e validação de documentos PDF.

### 4.3 PDF e dados estruturados

O arquivo PDF não é considerado um repositório definitivo do sistema.

A prioridade é armazenar os dados estruturados extraídos, com validação e prevenção de duplicidade,
sem converter o sistema em um armazenamento documental permanente de todos os PDFs recebidos.

## 5. Restrições atuais

A arquitetura atual não formaliza fornecedores definitivos de banco de dados, autenticação, hospedagem ou infraestrutura.

Esses itens devem ser registrados em momento próprio, quando houver decisão documental clara e aprovada.

## 6. Princípios arquiteturais

- simplicidade adequada ao MVP;
- baixo acoplamento entre módulos principais;
- preparação para evolução futura;
- separação de responsabilidades;
- validação antes da persistência de dados originados de automação;
- controle explícito sobre integrações auxiliares.

## 7. Estado do documento

Este documento representa a visão arquitetural inicial atualmente registrada para o projeto.

Decisões de infraestrutura ainda não foram formalizadas e, por isso, o documento permanece em revisão até que surja evidência suficiente para estabilizar escolhas futuras.
