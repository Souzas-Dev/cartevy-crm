# Padrão de Documentação

**Documento:** GOV-001 — Padrão de Documentação
**Versão:** 0.4
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 22/09/2026

---

## 1. Objetivo

Definir o padrão utilizado na documentação do projeto Cartevy CRM.

Este documento estabelece regras mínimas de organização, identificação, versionamento e manutenção dos documentos do projeto.

## 2. Estrutura documental

A documentação será organizada por domínio:

- `00-governanca` — controle e organização documental;
- `01-produto` — visão, escopo, requisitos e roadmap;
- `02-arquitetura` — arquitetura e decisões técnicas;
- `03-interface` — interface e experiência de uso;
- `04-integracoes` — integrações e automações;
- `05-deploy` — infraestrutura e implantação;
- `06-operacao` — utilização, manutenção e suporte.

Novas áreas somente deverão ser criadas quando existir necessidade real.

## 3. Identificação e nomenclatura

Todo documento controlado deverá possuir um código único e permanente.

Formato:

`PREFIXO-NÚMERO — Nome do Documento`

Exemplo:

`PRD-001 — Visão do Produto`

### 3.1 Prefixos

- `GOV` — Governança;
- `PRD` — Produto;
- `ARC` — Arquitetura;
- `UI` — Interface;
- `INT` — Integrações;
- `DEP` — Deploy;
- `OPS` — Operação;
- `ADR` — Decisão arquitetural.

### 3.2 Numeração

A numeração deverá utilizar três dígitos, iniciando em `001` e seguindo sequência própria dentro de cada categoria.

Códigos não deverão ser reutilizados.

### 3.3 Nome dos arquivos

Arquivos Markdown deverão utilizar nomes descritivos, em letras maiúsculas, sem espaços e sem acentuação.

Exemplos:

- `VISAO-PRODUTO.md`;
- `ESCOPO-MVP.md`;
- `PADRAO-DOCUMENTACAO.md`.

O código documental será registrado no cabeçalho e não precisa fazer parte do nome físico do arquivo.

## 4. Cabeçalho dos documentos controlados

Todo documento controlado deverá iniciar com um cabeçalho padronizado.

Formato oficial:

    # Título do Documento

    **Documento:** XXX-000 — Nome do Documento
    **Versão:** 0.1
    **Status:** Em revisão
    **Responsável:** Nome do responsável
    **Última atualização:** DD/MM/AAAA

    ---

Campos obrigatórios:

- **Documento:** código e nome oficial;
- **Versão:** versão vigente;
- **Status:** estado atual do documento;
- **Responsável:** responsável pela manutenção;
- **Última atualização:** data da última alteração relevante.

O cabeçalho deverá utilizar Markdown simples, manter um campo por linha e evitar tabelas.

O `README.md` da raiz é uma exceção e poderá utilizar estrutura própria.

## 5. Estados documentais

Todo documento controlado deverá possuir um dos seguintes estados:

- **Rascunho:** documento em elaboração inicial, ainda não submetido à validação;
- **Em revisão:** documento com conteúdo estruturado, aguardando validação ou aprovação;
- **Aprovado:** documento validado e adotado como referência oficial do projeto;
- **Obsoleto:** documento que deixou de ser referência vigente, mas é mantido para rastreabilidade histórica.

Um documento aprovado poderá continuar evoluindo por meio de novas versões.

Alterações relevantes em documentos aprovados deverão resultar em nova versão e, quando necessário, retornar temporariamente ao estado **Em revisão** até nova aprovação.

## 6. Versionamento documental

Os documentos controlados utilizarão o formato:

`MAJOR.MINOR`

Exemplos:

- `0.1`;
- `0.2`;
- `1.0`;
- `1.1`;
- `2.0`.

### 6.1 Versão inicial

Todo novo documento controlado deverá iniciar na versão `0.1`.

### 6.2 Incremento menor

O número **MINOR** deverá ser incrementado quando houver:

- correções;
- complementos;
- melhorias de redação;
- ajustes de estrutura;
- alterações que não modifiquem substancialmente a finalidade do documento.

Exemplo:

`0.1 → 0.2`

### 6.3 Incremento maior

O número **MAJOR** deverá ser incrementado quando houver mudança substancial de:

- finalidade;
- escopo;
- estrutura;
- diretrizes;
- decisões formalizadas pelo documento.

Exemplo:

`1.2 → 2.0`

### 6.4 Versão 1.0

A versão `1.0` representa a primeira edição considerada estável como referência documental do projeto.

Documentos poderão ser aprovados ainda em versões `0.x` durante a fase inicial de estruturação.

## 7. Linguagem e redação

A documentação deverá utilizar linguagem:

- objetiva;
- clara;
- técnica quando necessário;
- consistente entre documentos;
- adequada ao estágio real do projeto.

Deverá ser evitado:

- linguagem promocional;
- afirmações não verificadas;
- exagero sobre maturidade, resultados ou capacidades;
- duplicação desnecessária de conteúdo;
- termos ambíguos sem definição;
- descrição de funcionalidades planejadas como se já estivessem implementadas.

Funcionalidades, decisões e estados do projeto deverão ser descritos de acordo com sua situação real.

Quando uma informação estiver sujeita a decisão futura, isso deverá ser indicado explicitamente.

## 8. Rastreabilidade

A documentação deverá permitir identificar a relação entre requisitos, decisões, implementação e evolução do produto.

Sempre que aplicável:

- requisitos deverão possuir identificadores únicos;
- decisões arquiteturais deverão ser registradas por meio de ADRs;
- alterações relevantes deverão ser refletidas nos documentos afetados;
- o roadmap deverá representar o estado real do projeto;
- funcionalidades implementadas deverão estar relacionadas aos requisitos correspondentes;
- documentos substituídos deverão preservar sua identificação e histórico;
- mudanças de escopo deverão ser registradas nos documentos de produto relacionados.

A rastreabilidade deverá ser suficiente para compreender por que uma decisão foi tomada, onde ela foi registrada e quais partes do projeto foram afetadas.

## 9. Atualização e manutenção

A documentação deverá ser atualizada sempre que houver mudança relevante no produto, na arquitetura, no escopo, nos requisitos ou nas decisões registradas.

Código e documentação não deverão evoluir como fontes independentes de verdade.

Quando uma alteração afetar mais de um documento, todos os documentos relacionados deverão ser revisados para manter consistência.

Atualizações documentais deverão considerar:

- impacto no conteúdo existente;
- necessidade de alteração de versão;
- possível mudança de status;
- atualização da data de última modificação;
- preservação da rastreabilidade;
- consistência com documentos relacionados.

Correções puramente ortográficas ou de formatação poderão ser realizadas sem mudança de versão, desde que não alterem o significado do conteúdo.





### 9.1 Registros documentais operacionais

Documentos destinados ao registro contínuo do estado documental, como o índice documental e o changelog documental, poderão receber atualizações operacionais sem incremento de versão quando a alteração se limitar a:

- sincronizar versão ou status de documentos já registrados;
- incluir documento controlado recém-criado;
- registrar aprovação, revisão ou obsolescência já ocorrida;
- acrescentar novo evento documental ao histórico.

Essas atualizações deverão preservar a estrutura, a finalidade e as regras do documento.

Alterações na estrutura, nas regras de funcionamento ou na finalidade desses registros deverão seguir o versionamento documental normal.
