# Decisões de Arquitetura

Este diretório é destinado ao registro de decisões arquiteturais relevantes do projeto Cartevy CRM.

Ele funciona como orientação para os ADRs e **não é, por si só, um ADR nem um documento controlado**.

## 1. Finalidade

Preservar o contexto e a justificativa de decisões técnicas que impactem a estrutura, a implementação ou a evolução da aplicação.

## 2. Convenção

Quando uma decisão arquitetural precisar ser formalizada, ela deverá ser registrada em documento próprio e receber identificação sequencial conforme `GOV-001 — Padrão de Documentação`, utilizando o prefixo `ADR`.

Exemplos de identificação:

- `ADR-001`;
- `ADR-002`;
- `ADR-003`.

Cada ADR deverá registrar, no mínimo, o contexto da decisão, a decisão adotada e seus impactos relevantes.

## 3. Quando registrar um ADR

Um ADR deverá ser considerado quando houver:

- decisão técnica relevante;
- mudança de arquitetura ou abordagem;
- escolha que afete a implementação ou a evolução do produto;
- justificativa que precise ser preservada para rastreabilidade.

## 4. Estado atual

O projeto possui os seguintes ADRs aprovados:

- `ADR-001 — Fundação Técnica Inicial da Aplicação`, versão 0.1;
- `ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase`, versão 0.1;
- `ADR-003 — Autenticação Própria da Aplicação`, versão 0.1.

Permanecem pendentes de formalização conforme a evolução do projeto decisões importantes relacionadas à hospedagem da aplicação, infraestrutura definitiva de execução e futuras evoluções de autorização que excedam a fronteira server-side atualmente adotada.
