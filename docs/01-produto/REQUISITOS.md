# Requisitos do Produto

**Documento:** PRD-003 — Requisitos do Produto
**Versão:** 0.2
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

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
- a utilização de Telegram e do monitor local deve permanecer condicionada até confirmação formal;
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

O sistema deve permitir registrar clientes com dados essenciais para identificação e acompanhamento comercial.

### RF-010 — Reuso de cliente existente

O sistema deve verificar a existência de cliente compatível antes de criar um novo registro, considerando dados como código interno, CPF/CNPJ ou telefone.

### RF-011 — Consulta de clientes

O sistema deve permitir consultar clientes por nome, código interno, CPF/CNPJ ou telefone.

### RF-012 — Histórico comercial do cliente

O sistema deve apresentar o histórico de pedidos, follow-ups e encomendas relacionados ao cliente.

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

### RF-019 — Importação de pedidos por PDF

O sistema deve permitir importar dados de pedidos a partir de arquivos PDF, quando disponíveis no documento, incluindo número do pedido, código interno do cliente, nome, CPF/CNPJ, telefone, data do pedido e valor total.

### RF-020 — Validação da importação

O sistema deve validar os dados extraídos antes de confirmar o registro de um pedido importado, incluindo verificação de campos obrigatórios, inconsistências e duplicidade.

### RF-021 — Não persistência do PDF

O sistema deve tratar o PDF como fonte de processamento e persistir prioritariamente os dados estruturados extraídos, não sendo obrigatório armazenar o arquivo permanentemente.

### RF-022 — Origem do registro

O sistema deve registrar a origem do dado principal quando houver diferenciação entre cadastro manual e importação automatizada.

### RF-023 — Preparação para múltiplos usuários

A estrutura do sistema deve permitir, em evolução futura, associação de registros a diferentes usuários e responsáveis pela operação.

### RF-024 — Preparação para múltiplas organizações

A estrutura do sistema deve permitir, em evolução futura, associação de registros a diferentes organizações ou empresas.

### RF-025 — Configurações básicas

O sistema deve possuir um ambiente de configuração mínima para gestão básica do usuário e da aplicação.

### RF-026 — Manutenção de sessão

O sistema deve manter a sessão do usuário autenticado de forma adequada durante o uso da aplicação e encerrá-la quando houver logout.

### RF-027 — Atualização de clientes

O sistema deve permitir atualizar os dados cadastrais e comerciais de clientes existentes sem perder o histórico relacionado.

### RF-028 — Acompanhamento de encomendas

O sistema deve permitir atualizar o status, registrar o andamento e encerrar encomendas sem perder o histórico relacionado.
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

Pedido, cliente e histórico comercial devem estar vinculados de forma consistente.

### RN-003 — Duplicidade por pedido

O número do pedido deve ser tratado como chave de prevenção de duplicidade.

### RN-004 — Histórico por cliente

O histórico do cliente deve refletir seus pedidos, interações e pendências vinculadas.

### RN-005 — Follow-up como acompanhamento

Follow-up deve funcionar como registro de ação comercial futura, com status e data de execução ou conclusão.

### RN-006 — Encomenda como pendência comercial

Encomenda deve representar uma pendência ou acompanhamento específico relacionado ao pedido e ao relacionamento com o cliente.

### RN-007 — Validação por fluxo controlado

Qualquer dado originado de PDF ou automação externa deve passar por validação antes da confirmação final no sistema.

## 6. Requisitos condicionados

### RC-001 — Telegram

A utilização de um bot do Telegram como canal auxiliar para recebimento e processamento de PDFs deve ser tratada como requisito condicionado.

Sua obrigatoriedade para a primeira entrega depende de confirmação formal antes do aceite do MVP.

### RC-002 — Monitor local

O uso de um monitor local para observar diretórios e identificar novos PDFs deve ser tratado como requisito condicionado.

A presença de um arquivo em diretório não deve ser interpretada automaticamente como pedido válido. A confirmação deve ocorrer por fluxo controlado.

### RC-003 — Integrações auxiliares futuras

Outras integrações de automação ou canais externos devem ser tratadas como futuras e dependentes de decisão formal.

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

A versão 0.2 consolida correções de rastreabilidade e complementa requisitos funcionais necessários para manter aderência ao escopo aprovado do MVP, sem alterar seus limites, regras de negócio ou condicionamentos.

A versão 0.2 está **Aprovada** como referência oficial para os requisitos do produto.

Atualizações futuras devem preservar a coerência com PRD-001, PRD-002 e PRD-004 e devem ser acompanhadas de revisão de versão e status documental.

Nenhum requisito descrito aqui deverá ser interpretado automaticamente como funcionalidade já implementada.

O estado real de implementação deverá ser acompanhado pelo roadmap, histórico do projeto e documentação técnica.
