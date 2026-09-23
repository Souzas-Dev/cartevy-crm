# Arquitetura da Aplicação

**Documento:** ARC-001 — Arquitetura da Aplicação
**Versão:** 0.2
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

---

## 1. Finalidade

Este documento registra a visão arquitetural atualmente sustentada pelo projeto Cartevy CRM.

Ele não pretende estabelecer uma arquitetura definitiva para todos os cenários futuros, mas sim preservar as direções conhecidas e aceitáveis para a primeira fase do produto.

## 2. Direção atual

A aplicação principal é uma solução web orientada ao MVP, estruturada inicialmente em uma única base de aplicação.

A fundação técnica adotada está formalizada em `ADR-001 — Fundação Técnica Inicial da Aplicação` e utiliza:

- Next.js com App Router como framework principal da aplicação web;
- React para construção da interface;
- TypeScript como linguagem principal;
- Tailwind CSS com PostCSS para a base de estilização;
- ESLint para análise estática;
- npm para gerenciamento de dependências;
- diretório `app` como base inicial da aplicação principal.

A arquitetura permanece intencionalmente simples nesta etapa, permitindo que frontend e capacidades de servidor coexistam na mesma aplicação enquanto não houver requisito concreto que justifique separação adicional.

Componentes auxiliares poderão utilizar outras tecnologias, como Python, quando houver necessidade aprovada para processamento de PDF ou automações externas.

Banco de dados, autenticação, hospedagem e infraestrutura definitiva ainda não foram formalizados e permanecem sujeitos a decisões arquiteturais próprias.

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

A aplicação principal está estruturada no diretório `app` como uma aplicação Next.js com App Router, React e TypeScript.

A fundação atualmente implementada compreende a configuração técnica da aplicação, o layout raiz, a rota inicial, estilos globais e as ferramentas de desenvolvimento necessárias para lint e build de produção.

Conforme o produto evoluir, essa aplicação deverá concentrar o núcleo do CRM, incluindo:

- interface e navegação do usuário;
- regras de negócio da rotina comercial;
- capacidades de servidor necessárias à aplicação;
- persistência de dados estruturados, após decisão arquitetural própria;
- autenticação e controle de acesso, após decisão arquitetural própria;
- consultas, filtros e indicadores comerciais;
- interfaces controladas para importações e automações auxiliares.

A existência dessa responsabilidade arquitetural não significa que todas essas capacidades já estejam implementadas. Nesta etapa, somente a fundação técnica inicial da aplicação está disponível.

### 4.2 Automação externa

Componentes externos, quando aprovados, podem interagir com a aplicação principal por meio de interfaces controladas, sem exigir que o CRM se transforme em um sistema de automação geral.

A linguagem Python pode ser usada para processamentos auxiliares, como leitura e validação de documentos PDF.

### 4.3 PDF e dados estruturados

O arquivo PDF não é considerado um repositório definitivo do sistema.

A prioridade é armazenar os dados estruturados extraídos, com validação e prevenção de duplicidade,
sem converter o sistema em um armazenamento documental permanente de todos os PDFs recebidos.

## 5. Restrições atuais

A fundação técnica inicial da aplicação está formalizada em `ADR-001 — Fundação Técnica Inicial da Aplicação`.

Permanecem sem decisão arquitetural definitiva:

- banco de dados e estratégia de persistência;
- autenticação e controle de acesso;
- hospedagem;
- infraestrutura;
- serviços externos que possam vir a compor a operação.

Esses itens deverão ser formalizados em momento próprio, quando houver evidência e necessidade suficientes para sustentar a decisão.

A arquitetura atual também não pressupõe separação antecipada em múltiplos serviços. Novos componentes deverão ser introduzidos somente quando requisitos reais justificarem a complexidade adicional.
## 6. Princípios arquiteturais

- simplicidade adequada ao MVP;
- baixo acoplamento entre módulos principais;
- preparação para evolução futura;
- separação de responsabilidades;
- validação antes da persistência de dados originados de automação;
- controle explícito sobre integrações auxiliares.

## 7. Estado do documento

A versão 0.2 atualiza a visão arquitetural para refletir a fundação técnica efetivamente implementada e formalizada em `ADR-001 — Fundação Técnica Inicial da Aplicação`.

A arquitetura vigente estabelece uma aplicação web inicialmente concentrada em uma única base Next.js, mantendo abertas as decisões que ainda não possuem evidência suficiente para formalização.

Banco de dados, autenticação, hospedagem, infraestrutura e demais serviços externos permanecem sujeitos a decisões arquiteturais próprias conforme a evolução do projeto.

A existência dessas decisões pendentes não invalida a arquitetura atualmente registrada e não implica compromisso antecipado com fornecedores ou soluções específicas.
