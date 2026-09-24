# Requisitos do Produto

**Documento:** PRD-003 — Requisitos do Produto
**Versão:** 0.3
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 23/09/2026

---

## 1. Finalidade

Este documento consolida os requisitos do Cartevy CRM e estabelece a base para a implementação e validação do MVP.

Ele descreve requisitos funcionais, requisitos não funcionais, regras de negócio e condições que dependem de confirmação antes da primeira entrega.

A estrutura e os limites deste documento são coerentes com as visões registradas em PRD-001 e PRD-002.

## 2. Convenções

- Os requisitos devem ser verificáveis;
- cada requisito deve tratar preferencialmente uma obrigação;
- o texto deve manter foco em comportamento e resultado esperado;
- detalhes de implementação não devem ser transformados em requisitos de produto sem necessidade;
- requisitos dependentes de decisão futura devem ser claramente identificados como condicionados;
- monitor local e Telegram compõem o fluxo de ingestão aprovado, embora sua implementação permaneça em fases posteriores;
- os identificadores RNF-011, RNF-012 e RNF-013 permanecem sem uso na documentação vigente e não deverão ser reutilizados, preservando a estabilidade dos identificadores posteriores.

## 3. Requisitos funcionais

### RF-001 — Autenticação

O sistema deve permitir que usuários autorizados realizem login e logout.

### RF-002 — Proteção de áreas privadas

O sistema deve impedir acesso não autorizado às áreas internas e aos dados comerciais sensíveis.

### RF-003 — Dashboard

O sistema deve disponibilizar um dashboard com visão resumida da atividade comercial, incluindo valores vendidos, quantidade de pedidos, atividade comercial recente, follow-ups pendentes e encomendas em acompanhamento, quando houver dados disponíveis.

### RF-004 — Cadastro de pedidos

O sistema deve permitir registrar pedidos com informações essenciais para o acompanhamento comercial.

### RF-005 — Identificação de pedido

O sistema deve identificar cada pedido por meio de um identificador estável, com prioridade ao número do pedido para prevenção de duplicidade.

### RF-006 — Prevenção de duplicidade

O sistema deve impedir o registro duplicado de um mesmo pedido, utilizando o número do pedido como referência principal.

### RF-007 — Consulta de pedidos

O sistema deve permitir consultar pedidos por informação relevante, como número do pedido, cliente, data, valor e status relacionado.

### RF-008 — Detalhes do pedido

O sistema deve disponibilizar uma visualização específica para cada pedido com informações comerciais relevantes e histórico associado.

### RF-009 — Cadastro de clientes

O sistema deve manter cliente somente quando existir código interno formal da operação de origem.

### RF-010 — Reuso de cliente existente

O código interno deve ser utilizado como identificador primário para reutilização de cliente dentro da organização.

CPF/CNPJ poderá ser utilizado como verificação de consistência.

Nome não deverá ser utilizado como chave de identidade.

### RF-011 — Consulta de clientes

O sistema deve permitir consultar clientes por nome, código interno, CPF/CNPJ ou WhatsApp.

### RF-012 — Histórico comercial do cliente

O histórico deve refletir somente pedidos explicitamente vinculados ao cliente formal.

Vendas sem cadastro não deverão ser atribuídas automaticamente por semelhança de nome.
### RF-013 — Cadastro de follow-up

O sistema deve permitir registrar ações comerciais futuras vinculadas a clientes e pedidos.

### RF-014 — Visualização de follow-ups

O sistema deve permitir consultar follow-ups por situação, incluindo pendentes, atrasados, programados e concluídos.

### RF-015 — Conclusão e reagendamento

O sistema deve permitir concluir ou reagendar um follow-up sem perder o histórico da ação relacionada.

### RF-016 — Cadastro de encomendas

O sistema deve permitir registrar encomendas relacionadas à rotina comercial e acompanhar o seu andamento.

### RF-017 — Consulta e filtros

O sistema deve permitir buscar e filtrar registros por período e por dados relevantes de clientes, pedidos, follow-ups e encomendas.

### RF-018 — Observações comerciais

O sistema deve permitir registrar observações comerciais em registros relevantes, sem substituir campos estruturados.

### RF-019 — Dados estruturados do pedido importado

A ingestão deverá preparar, quando disponíveis:

- número do pedido;
- nome apresentado;
- código interno;
- CPF/CNPJ;
- WhatsApp;
- total de produtos;
- desconto total;
- frete;
- total geral;
- itens com descrição, quantidade e unidade.

### RF-020 — Validação antes da persistência oficial

Dados extraídos de PDF ou automação externa deverão permanecer temporários até a conclusão da validação.

Somente pedidos confirmados deverão compor o histórico oficial.

### RF-021 — Não persistência obrigatória do PDF

O PDF deverá ser tratado como fonte de extração e não precisa ser armazenado permanentemente pelo CRM.

### RF-022 — Venda sem cadastro formal

Pedido sem código interno deverá ser persistido como venda sem criar cliente.

A venda deverá participar dos cálculos comerciais por período, mas não deverá gerar histórico de cliente ou follow-up.
### RF-023 — Preparação para múltiplos usuários

A estrutura do sistema deve permitir, em evolução futura, associação de registros a diferentes usuários e responsáveis pela operação.

### RF-024 — Preparação para múltiplas organizações

A estrutura do sistema deve permitir, em evolução futura, associação de registros a diferentes organizações ou empresas.

### RF-025 — Configurações básicas

O sistema deve possuir um ambiente de configuração mínima para gestão básica do usuário e da aplicação.

### RF-026 — Manutenção de sessão

O sistema deve manter a sessão do usuário autenticado de forma adequada durante o uso da aplicação e encerrá-la quando houver logout.

### RF-027 — Atualização de clientes

O sistema deve permitir atualização manual apenas dos dados comerciais autorizados do cliente.

No fluxo normal do CRM, poderão ser alterados manualmente:

- WhatsApp;
- observações comerciais.

Nome, código interno e CPF/CNPJ provenientes da origem não deverão ser alterados manualmente.

Dados recebidos posteriormente pela origem poderão preencher campos estruturados ainda vazios, mas não deverão substituir silenciosamente valores existentes.
### RF-028 — Acompanhamento de encomendas

O sistema deve permitir atualizar o status, registrar o andamento e encerrar encomendas sem perder o histórico relacionado.

### RF-029 — Monitor local de preparação

O fluxo de ingestão deve prever um processo Python local capaz de monitorar os diretórios utilizados pela operação e preparar os dados estruturados necessários ao Cartevy.

O processo local não deve gravar diretamente nas tabelas oficiais do CRM.

### RF-030 — Staging temporário

Os dados preparados pelo processo local devem permanecer disponíveis de forma persistente o suficiente para sobreviver à reinicialização do computador e permitir validação posterior.

O staging temporário não representa histórico comercial oficial.

Antes da confirmação, uma nova preparação do mesmo número de pedido poderá substituir a versão temporária anterior.

### RF-031 — Validação via Telegram

O fluxo de ingestão deve prever validação dos pedidos preparados por meio do bot do Telegram.

O bot deverá validar os dados estruturados preparados e somente após confirmação promover o pedido ao banco oficial do CRM.

Pedido já confirmado no CRM não deverá ser sobrescrito silenciosamente.

## 4. Requisitos não funcionais

### RNF-001 — Responsividade

A interface deve funcionar adequadamente em computadores e dispositivos móveis, com prioridade para uso em desktop.

### RNF-002 — Desempenho

As operações principais devem responder de forma adequada em condições normais de uso.

### RNF-003 — Usabilidade

O sistema deve reduzir atritos operacionais e facilitar a rotina comercial do usuário.

### RNF-004 — Segurança

As áreas privadas devem exigir autenticação e os dados sensíveis devem ser tratados com restrição de acesso.

### RNF-005 — Proteção de dados pessoais

Informações como CPF, CNPJ e telefone devem ser exibidas apenas quando necessário ao contexto operacional.

### RNF-006 — Persistência

Dados confirmados devem permanecer disponíveis após reinicialização, encerramento e nova autenticação.

### RNF-007 — Integridade referencial

As relações entre cliente, pedido, follow-up, encomenda e usuário devem manter consistência.

### RNF-008 — Manutenibilidade

A aplicação deve ser organizada em camadas e manter separação clara entre interface, regras de negócio, persistência e integrações.

### RNF-009 — Documentação

Funcionalidades relevantes, arquitetura e decisões devem ser registradas e mantidas em documentação atualizada.

### RNF-010 — Evolução incremental

A solução deve permitir crescimento gradual sem reestruturação completa da aplicação.

### RNF-014 — Banco de dados

A solução de banco deverá suportar os dados previstos para o MVP e possuir integração adequada com a aplicação.

A escolha definitiva do provedor será registrada posteriormente como decisão de arquitetura.

### RNF-015 — Valores monetários

Valores monetários não deverão utilizar representação que possa causar erros de precisão.

A implementação deverá utilizar uma estratégia segura, como armazenamento em centavos inteiros ou tipo decimal apropriado no banco.

### RNF-016 — Datas e horários

Datas e horários deverão ser tratados de forma consistente.

O sistema deverá considerar corretamente o fuso horário utilizado pela operação.

### RNF-017 — Controle de duplicidade

O banco de dados e as regras de negócio deverão atuar em conjunto para reduzir a possibilidade de pedidos duplicados.

### RNF-018 — API segura

Endpoints destinados a integrações externas não deverão aceitar operações sensíveis sem autenticação ou mecanismo equivalente de autorização.

## 5. Regras de negócio

### RN-001 — Núcleo comercial

O sistema deve concentrar o acompanhamento comercial, e não substituir sistemas de faturamento, estoque, logística ou financeiro.

### RN-002 — Pedido como unidade central

Todo pedido confirmado deve existir como registro comercial próprio.

O vínculo com cliente é opcional quando a venda não possuir cadastro formal.

### RN-003 — Duplicidade por pedido

O número do pedido deve prevenir duplicidade dentro da organização.

Pedido já confirmado não deve ser sobrescrito silenciosamente.

### RN-004 — Histórico por cliente

Somente pedidos explicitamente vinculados ao cliente devem compor seu histórico.

### RN-005 — Follow-up como acompanhamento

Follow-up deve representar ação comercial futura para cliente formalmente cadastrado.

### RN-006 — Encomenda como pendência comercial

Encomenda deve representar pendência ou acompanhamento relacionado à rotina comercial.

### RN-007 — Validação por fluxo controlado

Dados originados de PDF ou automação externa devem ser validados antes da confirmação final.

### RN-008 — Código interno define cliente formal

A existência de código interno determina se o pedido poderá criar ou reutilizar cliente.

Sem código interno, a venda permanece sem cliente cadastrado.

### RN-009 — Nome não identifica cliente

Nome isolado nunca deve ser utilizado para mesclar ou reutilizar clientes automaticamente.

### RN-010 — Enriquecimento sem sobrescrita

Dados da origem podem preencher campos ainda vazios.

Valores existentes não devem ser substituídos silenciosamente.

### RN-011 — Venda sem cadastro

Venda sem cadastro deve participar dos cálculos diário, semanal, mensal e demais indicadores baseados em pedidos.

Ela não deve gerar histórico de cliente ou follow-up.

### RN-012 — Imutabilidade do pedido confirmado

Depois de confirmado no CRM, um pedido não deve ser sobrescrito silenciosamente.

Revisões anteriores à confirmação pertencem ao estágio temporário.

### RN-013 — Elegibilidade para follow-up

Somente pedidos associados a cliente formalmente cadastrado devem participar do fluxo de follow-up.
## 6. Integrações condicionadas

### RC-003 — Integrações auxiliares futuras

Integrações adicionais que não façam parte do fluxo aprovado de monitor local e Telegram permanecem condicionadas a decisão futura.
## 7. Requisitos futuros

### RFU-001 — Múltiplos usuários

A estrutura deve permitir evolução para múltiplos usuários e diferentes níveis de acesso.

### RFU-002 — Múltiplas organizações

A estrutura deve permitir evolução para múltiplas organizações ou empresas.

### RFU-003 — Relatórios e indicadores avançados

A solução deve evoluir para indicadores mais sofisticados, desde que sejam demandados por uso real e validados no produto.

Os seguintes requisitos estão previstos como possíveis evoluções, mas não fazem parte da primeira implementação:

- painel administrativo multiusuário;
- gestão avançada de permissões;
- metas comerciais;
- comissões;
- notificações automáticas;
- integração oficial com WhatsApp;
- integração com ERP;
- integração com Linx;
- integração com marketplaces;
- gráficos analíticos;
- exportação de relatórios;
- inteligência artificial;
- aplicativo móvel nativo;
- automações avançadas de atendimento.

Esses itens deverão ser avaliados antes de sua inclusão no roadmap de implementação.

## 8. Rastreabilidade

A rastreabilidade deste documento está alinhada aos seguintes marcos oficiais:

- PRD-001 — Visão do Produto;
- PRD-002 — Escopo do MVP;
- PRD-004 — Roadmap do Produto;
- GOV-001 — Padrão de Documentação.

Os requisitos deverão utilizar os identificadores definidos neste documento:

- `RF` para requisitos funcionais;
- `RNF` para requisitos não funcionais;
- `RN` para regras de negócio;
- `RC` para requisitos condicionados;
- `RFU` para requisitos futuros.

Sempre que uma funcionalidade for implementada, testada ou documentada tecnicamente, o identificador correspondente deverá ser utilizado como referência quando aplicável.

Exemplo:

RF-013 — Cadastro de follow-up.

Isso permitirá relacionar documentação, código, testes e alterações futuras de forma mais organizada.

## 9. Estado do documento

A versão 0.3 incorpora as regras de domínio confirmadas durante a Fase 3.

Foram formalizados:

- código interno como identidade formal do cliente;
- ausência de associação automática por nome;
- vendas sem cadastro formal;
- itens estruturados;
- enriquecimento somente de campos vazios;
- bloqueio de sobrescrita silenciosa;
- separação entre preparação temporária e histórico oficial;
- monitor local e Telegram como fluxo aprovado de ingestão futura;
- follow-up restrito a clientes formalmente cadastrados.

O documento permanece aprovado como referência dos requisitos do produto.
