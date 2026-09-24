# Escopo do MVP

**Documento:** PRD-002 — Escopo do MVP
**Versão:** 0.3
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 23/09/2026

---

## 1. Finalidade

Este documento define o escopo da primeira versão operacional do Cartevy CRM.

Seu objetivo é estabelecer:

- quais capacidades fazem parte do MVP;
- quais capacidades ficam fora do escopo inicial;
- quais premissas orientam a primeira versão;
- quais dependências deverão ser consideradas;
- quais critérios determinam que o MVP está apto para uso inicial.

Este documento define limites de produto e não substitui requisitos detalhados, decisões arquiteturais ou especificações técnicas.

## 2. Definição do MVP

O MVP corresponde à primeira versão operacional do Cartevy CRM destinada ao uso real na rotina comercial.

Essa versão deverá concentrar-se no núcleo necessário para organizar e acompanhar:

- clientes;
- pedidos;
- vendas;
- histórico comercial;
- follow-ups;
- encomendas;
- consultas e buscas;
- importação de dados de pedidos.

O MVP não tem como objetivo reproduzir toda a operação da empresa nem substituir sistemas responsáveis por faturamento, estoque, logística ou gestão financeira.

A prioridade será entregar uma solução utilizável, simples e confiável, evitando funcionalidades que aumentem a complexidade sem benefício imediato para a rotina comercial.

## 3. Usuário inicial

A primeira versão será destinada ao uso individual.

O MVP deverá atender a rotina comercial de um único usuário, sem exigir recursos completos de administração de equipes ou organizações.

Apesar disso, a estrutura do produto deverá evitar dependências que impeçam evolução futura para:

- múltiplos usuários;
- múltiplos vendedores;
- diferentes níveis de acesso;
- múltiplas organizações.

Essas capacidades futuras não fazem parte do escopo funcional do MVP, mas deverão ser consideradas nas decisões estruturais do projeto.

## 4. Escopo incluído

O MVP deverá contemplar as capacidades necessárias para executar e acompanhar a rotina comercial definida para a primeira versão.

As funcionalidades descritas nesta seção representam o limite funcional previsto para o MVP.

Capacidades identificadas como **condicionadas** fazem parte do escopo planejado, mas sua obrigatoriedade na primeira entrega dependerá da validação de necessidade, prazo e impacto técnico antes do fechamento do MVP.

Detalhes de comportamento, regras e critérios específicos serão documentados em `PRD-003 — Requisitos do Produto`.

### 4.1 Autenticação

O MVP deverá possuir autenticação para restringir o acesso aos dados comerciais.

A primeira versão deverá contemplar:

- login;
- logout;
- manutenção de sessão;
- proteção das áreas privadas da aplicação.

O MVP poderá operar inicialmente com apenas um usuário cadastrado.

### 4.2 Dashboard

O MVP deverá disponibilizar uma visão resumida da atividade comercial.

O Dashboard deverá permitir acompanhar, de forma rápida:

- valores vendidos;
- quantidade de pedidos;
- atividade comercial recente;
- follow-ups pendentes;
- encomendas em acompanhamento.

Os cálculos, filtros e critérios específicos dos indicadores serão definidos em `PRD-003 — Requisitos do Produto`.

### 4.3 Pedidos

O MVP deverá registrar e consultar os pedidos confirmados que compõem a operação comercial.

Cada pedido deverá preservar:

- número do pedido;
- nome apresentado no pedido;
- data de entrada oficial no CRM;
- total de produtos;
- desconto total;
- frete ou taxa de entrega;
- total geral;
- itens com descrição, quantidade e unidade de medida.

Um pedido poderá existir sem vínculo com cliente formalmente cadastrado.

Pedidos sem cliente cadastrado continuarão participando dos indicadores de vendas.

Pedidos confirmados não deverão ter seus valores importados alterados manualmente.

O sistema deverá impedir o registro duplicado do mesmo número de pedido dentro da mesma organização.
### 4.4 Clientes

O MVP deverá manter cadastro de cliente somente quando existir código interno da operação de origem.

O código interno caracteriza o cliente formalmente cadastrado.

O cadastro poderá conter:

- código interno;
- nome;
- CPF ou CNPJ, quando disponível;
- WhatsApp, quando disponível;
- observações comerciais;
- histórico de pedidos vinculados;
- histórico de follow-ups relacionados.

Nome isolado não deverá ser utilizado como chave de identidade.

Duas pessoas com o mesmo nome poderão permanecer como registros independentes.

Dados recebidos posteriormente poderão preencher campos ainda vazios, mas não deverão substituir silenciosamente valores existentes.

WhatsApp e observações poderão ser atualizados manualmente.

Nome, código interno e documento provenientes da origem não deverão ser editados manualmente no fluxo normal.
### 4.5 Follow-ups

O MVP deverá permitir registrar e acompanhar ações comerciais relacionadas a clientes formalmente cadastrados.

Pedidos vinculados a um cliente poderão participar do histórico comercial e do fluxo de follow-up.

Vendas sem cadastro formal de cliente não deverão gerar histórico de cliente nem follow-up.

Cada follow-up deverá permitir identificar:

- cliente relacionado;
- pedido relacionado, quando aplicável;
- data prevista;
- descrição da ação;
- status;
- observações.

As regras de criação automática, prazo e cadência serão definidas posteriormente no núcleo comercial.
### 4.6 Encomendas

O MVP deverá permitir registrar e acompanhar encomendas que ainda dependam de alguma ação comercial ou disponibilidade futura.

Cada encomenda deverá permitir identificar:

- cliente relacionado;
- produto ou descrição da solicitação;
- data do registro;
- status;
- previsão ou data relevante, quando aplicável;
- observações.

O sistema deverá facilitar a consulta das encomendas em aberto e do respectivo andamento.

Regras de status, atualização e encerramento serão definidas em `PRD-003 — Requisitos do Produto`.

### 4.7 Busca e consulta

O MVP deverá permitir localizar rapidamente informações comerciais registradas no sistema.

A busca deverá contemplar, quando aplicável:

- clientes;
- pedidos;
- follow-ups;
- encomendas.

A consulta deverá permitir encontrar registros por informações relevantes, como:

- nome do cliente;
- CPF ou CNPJ;
- telefone;
- número do pedido;
- código interno;
- termos relacionados ao registro.

Os critérios de busca, filtros e comportamento dos resultados serão definidos em `PRD-003 — Requisitos do Produto`.

### 4.8 Ingestão de pedidos a partir de PDF

Os pedidos em PDF da rotina comercial serão utilizados como fonte para preparação dos dados.

A extração deverá considerar somente os dados necessários ao Cartevy, incluindo:

- número do pedido;
- nome apresentado;
- código interno, quando existente;
- CPF ou CNPJ, quando existente;
- WhatsApp, quando existente;
- total de produtos;
- desconto total;
- frete;
- total geral;
- itens com descrição, quantidade e unidade.

O PDF não precisa ser armazenado permanentemente pelo CRM.

Dados extraídos localmente ainda não representam histórico oficial do Cartevy.

### 4.9 Validação via Telegram

O fluxo aprovado prevê um bot do Telegram como etapa de validação e confirmação.

O bot deverá operar sobre os dados estruturados preparados anteriormente.

Somente após validação e confirmação o pedido deverá ser persistido nas tabelas oficiais do CRM.

Pedido já confirmado não deverá ser sobrescrito silenciosamente por nova entrada com o mesmo número.

### 4.10 Monitor local e preparação temporária

O fluxo aprovado prevê um processo Python local para observar a estrutura de pedidos organizada por mês e dia.

Esse processo deverá:

- identificar os pedidos;
- extrair os campos relevantes;
- preparar dados estruturados temporários;
- sobreviver à reinicialização do computador;
- manter a versão mais recente de um pedido antes da confirmação;
- disponibilizar os dados para validação posterior.

A preparação local e o staging temporário não fazem parte do histórico oficial do CRM.

O PostgreSQL oficial deverá receber somente pedidos confirmados.
## 5. Escopo excluído do MVP

A primeira versão não deverá contemplar funcionalidades que desviem o produto de seu objetivo central de acompanhamento comercial.

Ficam fora do escopo inicial:

- emissão fiscal;
- faturamento;
- controle de estoque;
- separação de pedidos;
- logística;
- roteirização de entregas;
- controle financeiro;
- contas a pagar;
- contas a receber;
- gestão de fornecedores;
- gestão completa de produtos;
- integração direta com ERP;
- administração completa de múltiplos usuários;
- administração completa de equipes;
- administração completa de múltiplas organizações.

Essas capacidades poderão ser avaliadas futuramente, desde que façam sentido para a evolução do produto e não descaracterizem sua finalidade principal.

## 6. Premissas do MVP

O desenvolvimento e a validação da primeira versão considerarão as seguintes premissas:

- o uso inicial será individual;
- a aplicação deverá ser acessível por navegador;
- os dados comerciais deverão permanecer centralizados no CRM;
- arquivos PDF serão utilizados como fonte auxiliar de dados, sem necessidade de armazenamento permanente;
- importações deverão passar por validação antes do registro definitivo;
- o número do pedido será utilizado como referência principal para prevenção de duplicidades;
- automações deverão apoiar a operação sem assumir decisões comerciais de forma irrestrita;
- integrações auxiliares poderão operar fora da aplicação principal, desde que utilizem interfaces controladas;
- funcionalidades fora do escopo inicial não deverão bloquear a entrega do núcleo comercial;
- decisões técnicas deverão preservar possibilidade de evolução futura sem exigir arquitetura excessivamente complexa no MVP.

As premissas poderão ser revisadas caso mudanças reais na operação justifiquem alteração de escopo.

## 7. Dependências do MVP

A entrega da primeira versão dependerá da disponibilidade e configuração dos componentes necessários ao funcionamento do sistema.

Entre as principais dependências estão:

- ambiente de execução da aplicação web;
- banco de dados;
- mecanismo de autenticação;
- armazenamento seguro de variáveis e credenciais;
- processamento de arquivos PDF;
- serviço de bot do Telegram, caso a integração seja habilitada no MVP;
- processo local auxiliar, caso o monitor de arquivos seja habilitado no MVP;
- acesso à internet para serviços externos utilizados pela aplicação.

A indisponibilidade de uma integração auxiliar não deverá impedir o funcionamento do núcleo comercial do CRM, salvo quando a funcionalidade depender diretamente dela.

Dependências técnicas específicas deverão ser detalhadas na documentação de arquitetura, integração e deploy.

## 8. Critérios de aceite do MVP

O MVP será considerado apto para uso inicial quando permitir executar, de forma estável, o fluxo comercial essencial definido neste documento.

Para isso, deverão estar disponíveis e funcionais:

- autenticação e acesso às áreas privadas;
- cadastro e consulta de clientes;
- registro e consulta de pedidos;
- vínculo entre pedidos e clientes;
- acompanhamento de follow-ups;
- acompanhamento de encomendas;
- busca e consulta de informações comerciais;
- visualização dos principais indicadores no Dashboard;
- importação controlada de dados de pedidos por PDF;
- prevenção de duplicidade de pedidos;
- persistência confiável dos dados;
- proteção adequada das informações comerciais.

As capacidades classificadas como **condicionadas**, incluindo a integração via Telegram e o monitor local de arquivos, somente serão obrigatórias para o aceite do MVP caso sejam confirmadas para a primeira entrega.

O aceite funcional deverá considerar uso real da aplicação e correção de falhas que impeçam a operação comercial básica.

## 9. Controle de escopo

O desenvolvimento do MVP deverá permanecer limitado às capacidades formalmente definidas neste documento.

Novas funcionalidades, integrações ou alterações relevantes somente deverão ser incorporadas ao MVP após avaliação de:

- necessidade operacional;
- impacto no prazo;
- impacto técnico;
- aumento de complexidade;
- dependências adicionais;
- efeito sobre os critérios de aceite.

Demandas que não sejam essenciais para o funcionamento da primeira versão deverão ser registradas para avaliação futura, sem ampliar automaticamente o escopo vigente.

Qualquer alteração aprovada no escopo deverá resultar na revisão deste documento e dos requisitos relacionados.

## 10. Estado do documento

A versão 0.3 incorpora as regras confirmadas a partir da análise de pedidos reais da operação.

Passam a fazer parte do escopo aprovado:

- pedidos confirmados com itens estruturados;
- vendas sem cadastro formal contabilizadas sem criação de cliente;
- código interno como fronteira para existência de cliente formal;
- nome não utilizado como chave de identidade;
- enriquecimento somente de campos vazios;
- preservação de valores existentes;
- monitor local e Telegram como partes planejadas do fluxo de ingestão;
- persistência oficial somente após validação controlada.

Monitor local, bot do Telegram e automação de follow-up ainda não são funcionalidades implementadas.
