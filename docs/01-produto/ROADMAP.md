# Roadmap do Produto

**Documento:** PRD-004 — Roadmap do Produto
**Versão:** 0.5
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

---

## 1. Finalidade

Este documento organiza a evolução do CRM de Vendas em fases coerentes com o estágio documental e com o escopo do MVP definido em PRD-001 e PRD-002.

Ele não substitui os requisitos detalhados e deve ser usado como referência de progressão do projeto, sem prometer entregas que ainda não tenham sido aprovadas.

## 2. Estado atual

O projeto concluiu a **Fase 2 — Fundação da aplicação**.

A aplicação possui uma fundação técnica, arquitetural e visual navegável para os módulos iniciais do CRM, com estrutura compartilhada de interface e comportamento consistente entre as rotas.

A fundação entregue nesta fase inclui:

- Route Group `(crm)` para organização da aplicação principal;
- shell compartilhado;
- Dashboard;
- Pedidos;
- Clientes;
- Follow-ups;
- Encomendas;
- Configurações;
- sidebar adaptativa oculta por padrão;
- abertura da sidebar por botão ou proximidade do cursor;
- identificação visual da rota ativa;
- suporte aos modos claro e escuro;
- persistência local da preferência de tema;
- tipografia híbrida para identidade e elementos operacionais;
- componentes reutilizáveis de interface;
- comportamento básico de foco e teclado;
- fechamento da sidebar pela tecla Escape;
- estrutura responsiva inicial;
- validação por lint, build de produção e navegação manual.

A paleta neutra utilizada atualmente é provisória e não representa uma definição permanente da identidade visual do produto. A escolha de uma paleta definitiva poderá ser realizada posteriormente sem alterar a fundação funcional estabelecida nesta fase.

Persistência de dados, autenticação, regras completas de domínio e funcionalidades comerciais permanecem fora do escopo concluído da Fase 2.

A próxima etapa planejada é a **Fase 3 — Persistência e domínio**, que ainda não foi iniciada.
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

**Status:** concluída

Objetivo:

- criar a base da interface e da aplicação principal;
- preparar a navegação e os módulos iniciais;
- validar a estrutura da rotina comercial em operação.

Entregas concluídas:

- criação do Route Group `(crm)` para organização da área principal;
- implementação do shell compartilhado das rotas do CRM;
- criação das rotas de Dashboard, Pedidos, Clientes, Follow-ups, Encomendas e Configurações;
- implementação da navegação principal;
- identificação visual da rota ativa;
- implementação da estrutura inicial do Dashboard;
- implementação de sidebar adaptativa oculta por padrão;
- abertura da sidebar por botão ou proximidade do cursor no desktop;
- fechamento da sidebar pelo botão, área externa no mobile e tecla Escape;
- gerenciamento básico de foco durante abertura e fechamento do menu;
- implementação dos modos claro e escuro;
- persistência local da preferência de tema;
- adoção de tipografia híbrida para identidade e elementos operacionais;
- criação dos componentes reutilizáveis `PageHeader`, `Surface` e `ModulePlaceholder`;
- redução da duplicação estrutural entre os módulos;
- preparação responsiva inicial da interface;
- validação manual da navegação, sidebar e alternância de tema;
- validação técnica por ESLint e build de produção.

A paleta neutra utilizada durante esta fase permanece provisória. A definição de uma identidade cromática definitiva será tratada posteriormente conforme a evolução visual do produto.

A conclusão desta fase não inclui persistência, autenticação, regras completas de domínio, CRUD comercial ou integrações externas.
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

A versão 0.5 registra a conclusão da **Fase 2 — Fundação da aplicação**.

A fase foi encerrada após a consolidação da estrutura navegável do CRM, dos módulos iniciais, do Dashboard, do shell compartilhado, da sidebar adaptativa, dos modos claro e escuro, da tipografia híbrida, dos componentes reutilizáveis de interface e dos comportamentos básicos de acessibilidade e teclado.

A aplicação foi validada por ESLint, build de produção e testes manuais das rotas, navegação, sidebar, tecla Escape e persistência do tema.

A paleta neutra atual permanece deliberadamente provisória.

A **Fase 3 — Persistência e domínio** permanece como próxima etapa planejada e ainda não é considerada iniciada.

Telegram, monitor local e demais integrações condicionadas permanecem fora do compromisso obrigatório desta etapa.
