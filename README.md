# Cartevy CRM

**by Souzas Dev**

> Sua carteira comercial em movimento.
## Visão geral

O Cartevy CRM é um projeto documental e funcional em fase inicial, voltado ao acompanhamento comercial de clientes, pedidos, vendas, follow-ups e encomendas.

A proposta principal é centralizar informações que hoje permanecem dispersas e facilitar a rotina de um vendedor sem substituir sistemas especializados em faturamento, estoque, logística ou gestão financeira.

## Estado atual

O projeto está em estágio predominantemente documental.

- contexto do produto consolidado;
- escopo do MVP definido;
- requisitos principais estruturados;
- roadmap inicial organizado;
- implementação técnica ainda não iniciada.

## Escopo resumido

O foco do produto é apoiar a rotina comercial com:

- clientes;
- pedidos;
- vendas;
- histórico comercial;
- follow-ups;
- encomendas;
- busca e consulta;
- indicadores comerciais;
- importação de dados de pedidos por PDF.

O CRM não é um ERP e não cobre faturamento, estoque, logística, financeiro ou gestão de fornecedores.

## Estrutura principal

```text
crm-vendas/
├── README.md
├── docs/
│   ├── 00-governanca/
│   │   ├── INDICE.md
│   │   ├── PADRAO-DOCUMENTACAO.md
│   │   └── CHANGELOG.md
│   ├── 01-produto/
│   │   ├── VISAO-PRODUTO.md
│   │   ├── ESCOPO-MVP.md
│   │   ├── REQUISITOS.md
│   │   └── ROADMAP.md
│   ├── 02-arquitetura/
│   │   ├── ARQUITETURA.md
│   │   └── decisoes/
│   │       └── README.md
│   ├── 03-interface/
│   ├── 04-integracoes/
│   ├── 05-deploy/
│   └── 06-operacao/
```

## Documentação

- [docs/00-governanca/PADRAO-DOCUMENTACAO.md](docs/00-governanca/PADRAO-DOCUMENTACAO.md)
- [docs/00-governanca/INDICE.md](docs/00-governanca/INDICE.md)
- [docs/00-governanca/CHANGELOG.md](docs/00-governanca/CHANGELOG.md)
- [docs/01-produto/VISAO-PRODUTO.md](docs/01-produto/VISAO-PRODUTO.md)
- [docs/01-produto/ESCOPO-MVP.md](docs/01-produto/ESCOPO-MVP.md)
- [docs/01-produto/REQUISITOS.md](docs/01-produto/REQUISITOS.md)
- [docs/01-produto/ROADMAP.md](docs/01-produto/ROADMAP.md)
- [docs/02-arquitetura/ARQUITETURA.md](docs/02-arquitetura/ARQUITETURA.md)

## Princípios

- simplicidade operacional;
- baixo atrito para o usuário;
- documentação contínua;
- evolução incremental;
- controle de escopo;
- preparação para expansão futura sem complexidade prematura;
- proteção de dados e redução de riscos operacionais.

## Roadmap resumido

A evolução do projeto segue por fases documentadas em [docs/01-produto/ROADMAP.md](docs/01-produto/ROADMAP.md), começando pela base documental e pela estrutura técnica, seguida pela fundamentação da aplicação, persistência, autenticação e núcleo comercial.

A importação de pedidos por PDF e as integrações condicionadas de Telegram e monitor local permanecem planejadas, mas não como requisitos obrigatórios do MVP sem confirmação formal.

## Estado das funcionalidades

| Área | Estado |
|---|---|
| Fundação documental | Concluída |
| Estrutura técnica do projeto | Próxima |
| Aplicação web principal | Não iniciada |
| Persistência | Não iniciada |
| Autenticação | Não iniciada |
| Núcleo comercial | Não iniciada |
| Importação de PDFs | Planejada |
| Telegram | Condicionado |
| Monitor local | Condicionado |
| Deploy | Não iniciada |

## Observação

Este repositório está, no momento, orientado à documentação e ao alinhamento do produto. Nenhuma funcionalidade deve ser tratada como implementada sem confirmação formal do desenvolvimento e validação correspondente.

A evolução para múltiplos usuários, vendedores e organizações é uma direção futura, mas não substitui o foco atual do MVP em uso individual e operação comercial simples.
