# Roadmap do Produto

**Documento:** PRD-004 — Roadmap do Produto
**Versão:** 0.10
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 24/09/2026

---

## 1. Finalidade

Este documento organiza a evolução do Cartevy CRM em fases coerentes com o estágio documental e com o escopo do MVP definido em PRD-001 e PRD-002.

Ele não substitui os requisitos detalhados e deve ser usado como referência de progressão do projeto, sem prometer entregas que ainda não tenham sido aprovadas.

## 2. Estado atual

O projeto concluiu a **Fase 4 — Autenticação**.

A etapa introduziu autenticação própria integrada ao domínio existente do Cartevy CRM e validou o fluxo contra o PostgreSQL utilizado pelo projeto.

A Fase 4 entregou:

- autenticação própria server-side;
- credencial separada de `AppUser`;
- username canônico;
- proteção de senha com HMAC-SHA256 e Argon2id;
- sessões persistidas no PostgreSQL;
- token bruto restrito ao servidor e ao cookie;
- persistência somente do hash do token;
- cookies seguros de sessão;
- expiração por inatividade e duração absoluta;
- login e logout;
- proteção das áreas internas;
- contexto autenticado com `appUserId` e `organizationId`;
- rate limiting persistente por username e IP confiável;
- eventos estruturados de segurança;
- bootstrap controlado do primeiro usuário;
- cleanup controlado de sessões e buckets;
- headers de segurança e Content Security Policy;
- nova migration de autenticação;
- testes unitários e de política;
- teste real de persistência da autenticação;
- formalização arquitetural por `ADR-003 — Autenticação Própria da Aplicação`.

A autenticação estabelece a identidade necessária para as próximas operações comerciais, mas não implementa administração completa de usuários, níveis de permissão ou policies RLS baseadas diretamente na sessão do Cartevy.

A **Fase 5 — Núcleo comercial** está em andamento.

Neste marco, a fase foi iniciada pelo planejamento técnico e pela definição da ordem incremental de implementação. Nenhum módulo comercial da Fase 5 é considerado concluído até passar pelos gates técnicos e funcionais definidos neste documento.
## 3. Fases do projeto

### Fase 0 — Fundação documental

**Status:** Aprovado

Objetivo:

- consolidar a visão do produto;
- definir o escopo do MVP;
- registrar requisitos iniciais;
- documentar diretrizes gerais do projeto.

### Fase 1 — Estrutura técnica do projeto

**Status:** Aprovado

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

**Status:** Aprovado

Objetivo:

- criar a base da interface e da aplicação principal;
- preparar a navegação e os módulos iniciais;
- validar a estrutura da rotina comercial em operação.

Entregas concluídas:

- criação do Route Group `(crm)`;
- implementação do shell compartilhado das rotas do CRM;
- criação das rotas de Dashboard, Pedidos, Clientes, Follow-ups, Encomendas e Configurações;
- implementação da navegação principal;
- identificação visual da rota ativa;
- implementação da estrutura inicial do Dashboard;
- sidebar adaptativa com comportamento para desktop e mobile;
- gerenciamento básico de foco durante abertura e fechamento do menu;
- modos claro e escuro;
- persistência local da preferência de tema;
- tipografia híbrida;
- componentes reutilizáveis `PageHeader`, `Surface` e `ModulePlaceholder`;
- preparação responsiva inicial;
- validação manual da navegação, sidebar e alternância de tema;
- validação técnica por ESLint e build de produção.

A paleta neutra utilizada durante esta fase permanece provisória.

### Fase 3 — Persistência e domínio

**Status:** concluída

Objetivo:

- modelar os dados principais;
- definir persistência e integridade;
- estabelecer regras centrais de domínio;
- preparar uma base segura para o núcleo comercial.

Entregas concluídas:

- PostgreSQL gerenciado pelo Supabase;
- Prisma 7;
- cinco migrations aplicadas;
- constraints e índices;
- RLS habilitado;
- modelo revisado com pedidos reais;
- entidade `OrderItem`;
- pedidos sem `Customer` para vendas sem cadastro;
- código interno obrigatório em clientes formais;
- nome fora da estratégia de identidade;
- enriquecimento controlado;
- bloqueio de sobrescrita silenciosa;
- repositories e services;
- persistência transacional;
- seed controlado;
- testes de domínio;
- testes reais de persistência e isolamento.

A Fase 3 não inclui autenticação, policies RLS baseadas em identidade, CRUD comercial completo, monitor Python, bot do Telegram ou geração automática de follow-ups.

### Fase 4 — Autenticação

**Status:** concluída

Objetivo:

- proteger o acesso às áreas internas;
- associar registros a usuários e responsabilidades;
- implementar autorização coerente com a separação por organização;
- preparar a aplicação para evolução de uso individual para uso compartilhado.

Entregas concluídas:

- autenticação própria integrada a `AppUser`;
- credenciais próprias com username;
- proteção de senha com Argon2id e pepper server-side;
- sessões persistidas e revogáveis;
- cookies seguros de sessão;
- login e logout;
- proteção das rotas internas;
- contexto autenticado derivado do servidor;
- organização derivada do usuário persistido;
- rate limiting persistente;
- eventos de segurança;
- bootstrap controlado;
- cleanup operacional;
- segurança HTTP e CSP;
- migration `20260924_authentication_foundation`;
- testes automatizados;
- validação real contra PostgreSQL;
- `ADR-003 — Autenticação Própria da Aplicação`.

A Fase 4 não inclui administração completa de múltiplos usuários, níveis de acesso, recuperação automática de senha, MFA ou policies RLS baseadas diretamente na sessão do Cartevy.

### Fase 5 — Núcleo comercial

**Status:** em andamento

Objetivo:

- disponibilizar clientes, pedidos, histórico, follow-ups e encomendas;
- consolidar o cotidiano operacional do CRM;
- permitir uso real do sistema sem dependência de automações auxiliares.

Plano de execução:

#### 5.0 — Contratos do núcleo comercial

Objetivo:

- estabelecer os contratos compartilhados antes da implementação das interfaces;
- aplicar a identidade autenticada da Fase 4 às operações comerciais;
- definir padrões de consulta, filtros, paginação, datas, valores e validação;
- impedir que identificadores de organização enviados pelo cliente sejam utilizados como autoridade de acesso.

Diretrizes:

- `organizationId` deverá ser derivado do `AuthContext` server-side;
- `appUserId` deverá ser derivado do contexto autenticado quando a operação exigir responsável;
- ações e consultas comerciais deverão aplicar isolamento explícito por organização;
- componentes de interface não deverão substituir validação, autorização ou regras de domínio server-side.

#### 5.1 — Clientes

Objetivo:

- implementar listagem e busca de clientes;
- permitir consulta por nome, código interno, documento e WhatsApp;
- disponibilizar detalhe do cliente;
- exibir histórico de pedidos explicitamente vinculados;
- exibir histórico de follow-ups relacionados;
- permitir atualização manual somente de WhatsApp e observações comerciais.

A identidade formal do cliente continuará baseada no código interno da origem. Nome não deverá ser utilizado para associação automática.

#### 5.2 — Pedidos

Objetivo:

- implementar listagem, busca e filtros de pedidos;
- disponibilizar detalhe do pedido e seus itens;
- preservar vendas sem cadastro formal;
- permitir registro manual de pedido já confirmado para uso operacional antes das fases de automação;
- reutilizar a regra central de persistência de pedidos confirmados e a prevenção existente de duplicidade.

Pedidos confirmados não deverão ser sobrescritos silenciosamente.

#### 5.3 — Follow-ups

Objetivo:

- permitir criação de follow-up para cliente formal;
- permitir associação opcional com pedido;
- implementar consulta por situação e período;
- permitir conclusão;
- permitir reagendamento sem perda do histórico relacionado.

Persistência deverá continuar utilizando os estados `PENDING` e `COMPLETED`.

As situações operacionais `OVERDUE`, `TODAY`, `UPCOMING` e `COMPLETED` deverão ser derivadas pela regra de domínio existente a partir do status, da data prevista e do fuso horário aplicável.

Vendas sem cliente formal não deverão participar do fluxo de follow-up.

#### 5.4 — Encomendas

Objetivo:

- permitir registro de encomendas relacionadas a pedidos;
- implementar consulta e filtros;
- acompanhar evolução de status;
- permitir registro de previsão e observações;
- permitir encerramento sem perda do histórico relacionado.

A relação existente com `Order` será mantida como referência comercial da encomenda nesta etapa. Não será introduzido vínculo redundante direto com `Customer` sem necessidade operacional comprovada.

#### 5.5 — Dashboard e consultas operacionais

Objetivo:

- substituir indicadores estáticos por dados reais;
- apresentar valores vendidos e quantidade de pedidos;
- apresentar atividade comercial recente;
- apresentar follow-ups pendentes;
- apresentar encomendas em acompanhamento;
- consolidar as consultas e filtros necessários ao uso diário.

Indicadores baseados em pedidos deverão considerar também vendas sem cadastro formal quando a regra de produto assim determinar.

#### 5.6 — Validação e fechamento da fase

Objetivo:

- validar os fluxos comerciais de ponta a ponta;
- revisar autorização e isolamento por organização;
- validar regras de domínio e persistência;
- executar testes automatizados aplicáveis;
- executar validações reais de persistência quando necessárias;
- revisar responsividade e uso operacional;
- atualizar documentação;
- concluir a Fase 5 somente após os gates aplicáveis serem aprovados.

Diretrizes gerais da Fase 5:

- reutilizar repositories, services, schemas e invariantes existentes antes de criar caminhos paralelos;
- manter regras de negócio fora dos componentes de interface;
- preservar separação entre interface, domínio, services e persistência;
- utilizar a sessão autenticada como origem da identidade operacional;
- não antecipar monitor Python, staging ou Telegram;
- não introduzir administração completa de múltiplos usuários ou níveis avançados de permissão;
- não tratar RLS como substituto da autorização server-side.

Gates internos de progressão:

- **Gate 5.0:** contratos compartilhados de autorização e consulta definidos e testáveis;
- **Gate 5.1:** Clientes utilizável para consulta, detalhe, histórico e edição permitida;
- **Gate 5.2:** Pedidos utilizável para consulta, detalhe e registro manual controlado;
- **Gate 5.3:** Follow-ups utilizável para criação, acompanhamento, conclusão e reagendamento;
- **Gate 5.4:** Encomendas utilizável para criação, acompanhamento de status e encerramento;
- **Gate 5.5:** Dashboard e consultas alimentados por dados reais;
- **Gate 5.6:** testes, validação operacional, documentação e CI aprovados.

Nenhuma subetapa deverá ser considerada concluída somente pela existência da interface. O gate correspondente deverá incluir comportamento server-side, autorização, persistência e validação aplicáveis.

### Fase 6 — Ingestão local e preparação de pedidos

**Status:** futura

Objetivo:

- implementar o monitor Python da estrutura local de pedidos;
- extrair somente os campos definidos para o Cartevy;
- preparar dados estruturados temporários;
- manter a preparação resistente a reinicialização;
- preservar a versão mais recente de um pedido antes da confirmação;
- disponibilizar os dados para validação posterior.

### Fase 7 — Validação operacional via Telegram

**Status:** futura

Objetivo:

- implementar o bot do Telegram como etapa de validação;
- validar os pedidos contra os dados preparados;
- promover somente pedidos confirmados ao banco oficial;
- preservar idempotência;
- impedir sobrescrita silenciosa de pedido já confirmado.
### Fase 8 — Deploy e estabilização

**Status:** Aprovado

Objetivo:

- preparar a aplicação para execução em ambiente real;
- estabilizar a operação;
- revisar documentação, segurança e uso em produção.

### Fase 9 — Validação do MVP

**Status:** Aprovado

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
- a evolução não introduzir complexidade desnecessária;
- os gates técnicos aplicáveis estiverem aprovados.

Para mudanças versionadas no repositório, a branch `main` deve permanecer protegida pelo fluxo de Pull Request e pelos checks de CI definidos para o projeto.

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

A modelagem atual já prepara associações por organização e responsável, mas isso não transforma essas evoluções em funcionalidades concluídas.

## 6. Estado do documento

A versão 0.10 registra o início da **Fase 5 — Núcleo comercial** e formaliza sua execução incremental.

A Fase 4 — Autenticação permanece concluída e fornece a identidade server-side e o `organizationId` que deverão ser utilizados pelas operações comerciais.

A Fase 5 foi organizada em:

- 5.0 — contratos do núcleo comercial;
- 5.1 — Clientes;
- 5.2 — Pedidos;
- 5.3 — Follow-ups;
- 5.4 — Encomendas;
- 5.5 — Dashboard e consultas operacionais;
- 5.6 — validação e fechamento da fase.

Neste marco, nenhuma entrega funcional da Fase 5 é considerada concluída.

A execução deverá preservar autorização server-side por organização, reutilização das regras de domínio existentes e separação entre interface, domínio, services e persistência.

Policies RLS baseadas diretamente na sessão do Cartevy, administração completa de usuários e níveis avançados de permissão permanecem fora da implementação atual.

O fluxo futuro aprovado de ingestão permanece:

`pasta local → monitor Python → staging temporário → Telegram → validação → PostgreSQL oficial → Cartevy CRM`.

Monitor local, staging e Telegram ainda não estão implementados.
