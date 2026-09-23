# Roadmap do Produto

**Documento:** PRD-004 — Roadmap do Produto
**Versão:** 0.3
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

---

## 1. Finalidade

Este documento organiza a evolução do CRM de Vendas em fases coerentes com o estágio documental e com o escopo do MVP definido em PRD-001 e PRD-002.

Ele não substitui os requisitos detalhados e deve ser usado como referência de progressão do projeto, sem prometer entregas que ainda não tenham sido aprovadas.

## 2. Estado atual

O projeto encontra-se na **Fase 2 — Fundação da aplicação**, atualmente em andamento.

A **Fase 1 — Estrutura técnica do projeto** foi concluída após a implementação e validação da fundação técnica inicial, incluindo a estrutura Next.js, configuração das ferramentas de desenvolvimento e formalização da arquitetura vigente.

A Fase 2 concentra a evolução da interface principal, da navegação e da estrutura inicial dos módulos do CRM.

As funcionalidades comerciais completas, a persistência de dados e a autenticação ainda não foram implementadas e permanecem previstas para as fases correspondentes do roadmap.

## 3. Fases do projeto

### Fase 0 — Fundação documental

**Status:** concluída

Objetivo:
- consolidar a visão do produto;
- definir o escopo do MVP;
- registrar requisitos iniciais;
- documentar diretrizes gerais do projeto.

### Fase 1 — Estrutura técnica do projeto

**Status:** concluída

Objetivo:
- iniciar a organização do repositório;
- preparar a base técnica do projeto;
- definir a estrutura inicial da aplicação;
- estabelecer a base para o desenvolvimento futuro.


Progresso registrado:

- repositório Git inicializado e publicado no GitHub;
- estrutura manual da aplicação Next.js criada;
- Next.js, React e TypeScript configurados;
- ESLint configurado e validado sem erros;
- Tailwind CSS e PostCSS configurados;
- estrutura inicial do App Router criada;
- dependências instaladas e compatibilizadas;
- build de produção executado com sucesso;
- rota inicial da aplicação validada como conteúdo estático.

### Fase 2 — Fundação da aplicação

**Status:** em andamento

Objetivo:
- criar a base da interface e da aplicação principal;
- preparar a navegação e os módulos iniciais;
- validar a estrutura da rotina comercial em operação.

### Fase 3 — Persistência e domínio

**Status:** futura

Objetivo:
- modelar os dados principais;
- definir persistência e integridade;
- estabelecer as regras de negócio centrais.

### Fase 4 — Autenticação

**Status:** futura

Objetivo:
- proteger o acesso às áreas internas;
- associar registros a usuários e responsabilidades;
- preparar a aplicação para evolução de uso individual para uso compartilhado.

### Fase 5 — Núcleo comercial

**Status:** futura

Objetivo:
- disponibilizar clientes, pedidos, histórico, follow-ups e encomendas;
- consolidar o cotidiano operacional do CRM;
- permitir uso real do sistema sem dependência de automações auxiliares.

### Fase 6 — Importação de pedidos por PDF

**Status:** futura

Objetivo:
- reduzir a digitação manual;
- extrair dados estruturados de pedidos em PDF;
- validar e registrar informações relevantes;
- prevenir duplicidade de pedidos.

### Fase 7 — Integrações condicionadas

**Status:** condicionada

Objetivo:
- implementar canais auxiliares apenas se a necessidade for confirmada;
- manter Telegram e monitor local como capacidades planejadas, mas não obrigatórias para o MVP inicial.

### Fase 8 — Deploy e estabilização

**Status:** futura

Objetivo:
- preparar a aplicação para execução em ambiente real;
- estabilizar a operação;
- revisar documentação, segurança e uso em produção.

### Fase 9 — Validação do MVP

**Status:** futura

Objetivo:
- verificar se a solução atende ao escopo acordado;
- confirmar estabilidade e maturidade do produto inicial;
- registrar alterações finais antes da entrada em uso operacional.

## 4. Critérios de progressão

A transição entre fases deve ocorrer somente quando:

- a etapa anterior estiver concluída e validada;
- os objetivos da fase seguinte estiverem claramente definidos;
- o escopo permanecer coerente com PRD-001 e PRD-002;
- as mudanças relevantes forem documentadas;
- a evolução não introduzir complexidade desnecessária.

## 5. Evoluções posteriores ao MVP

Após a validação do MVP, poderão ser avaliadas evoluções como:

- múltiplos usuários;
- múltiplos vendedores;
- diferentes níveis de acesso;
- múltiplas organizações;
- indicadores mais avançados;
- integrações complementares;
- automações adicionais;
- expansão do produto para uso mais amplo.

Essas evoluções não devem ser tratadas como compromissos do MVP atual.

## 6. Estado do documento

A versão 0.3 registra a conclusão da **Fase 1 — Estrutura técnica do projeto** e o início da **Fase 2 — Fundação da aplicação**.

A transição ocorre após a implementação e validação da fundação técnica inicial, a formalização da arquitetura vigente em `ARC-001 — Arquitetura da Aplicação` e a aprovação de `ADR-001 — Fundação Técnica Inicial da Aplicação`.

A Fase 2 passa a concentrar a construção da interface principal, da navegação e da estrutura inicial dos módulos do CRM, sem antecipar persistência, autenticação ou funcionalidades comerciais completas previstas para fases posteriores.

Telegram, monitor local e demais integrações condicionadas permanecem fora do compromisso obrigatório desta etapa.
