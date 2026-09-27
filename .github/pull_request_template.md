## Objetivo

<!-- Explique de forma curta o problema resolvido ou a finalidade deste PR. -->

## Alterações

<!-- Liste as principais mudanças realizadas. -->

-

## Validação

<!-- Marque o que foi executado. Explique abaixo qualquer item não aplicável ou não executado. -->

- [ ] `npm --prefix app run lint`
- [ ] `npm --prefix app test`
- [ ] `npm --prefix app run build`
- [ ] `CI / Quality` concluído com sucesso

## Segurança e isolamento

<!-- Marque os itens aplicáveis. -->

- [ ] Nenhum segredo, credencial ou dado sensível foi adicionado ao repositório.
- [ ] Alterações autenticadas preservam a autorização server-side.
- [ ] Operações multi-tenant utilizam o `organizationId` derivado do contexto autenticado, quando aplicável.

## Banco de dados e migrations

<!-- Marque a opção aplicável. -->

- [ ] Este PR não altera schema ou migrations.
- [ ] Este PR altera o banco por meio de nova migration versionada e não modifica migrations já aplicadas.

## Documentação

<!-- Marque a opção aplicável. -->

- [ ] A documentação foi atualizada porque houve mudança de comportamento, arquitetura, processo ou escopo.
- [ ] Não há atualização documental necessária para este PR.

## Fora de escopo

<!-- Registre explicitamente o que este PR não pretende resolver. -->

-