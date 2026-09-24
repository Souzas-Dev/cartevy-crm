# Autenticação Própria da Aplicação

**Documento:** ADR-003 — Autenticação Própria da Aplicação
**Versão:** 0.1
**Status:** Aprovado
**Responsável:** Eduardo Souza
**Última atualização:** 24/09/2026

---

## 1. Contexto

O Cartevy CRM precisa restringir o acesso às áreas internas e aos dados comerciais conforme os requisitos RF-001, RF-002, RF-026 e RNF-004.

A persistência já possui `Organization` e `AppUser`, além de isolamento explícito por organização na camada server-side. A Fase 4 precisava acrescentar identidade autenticada, credenciais, sessões e proteção de acesso sem introduzir administração completa de equipes ou múltiplas organizações, que permanecem fora do escopo funcional do MVP.

A solução também precisava permanecer compatível com:

- a aplicação única Next.js definida em ADR-001;
- PostgreSQL, Prisma 7 e Supabase definidos em ADR-002;
- o uso inicial individual previsto para o MVP;
- a preparação estrutural para múltiplos usuários e organizações;
- o princípio de manter segredos e credenciais fora do cliente e do versionamento.

## 2. Decisão

O Cartevy CRM utilizará autenticação própria implementada na camada server-side da aplicação Next.js.

A autenticação não utiliza Supabase Auth como provedor de identidade.

A solução adotada utiliza:

- `AppUser` como identidade de aplicação;
- `AuthCredential` para credencial própria;
- username canônico como identificador de login;
- senha protegida por Argon2id;
- pepper server-side separado do hash persistido;
- sessões persistidas no PostgreSQL;
- token de sessão aleatório entregue somente por cookie;
- persistência exclusiva do hash SHA-256 do token;
- cookies `HttpOnly`;
- `SameSite=Strict`;
- cookie `Secure` fora do ambiente de desenvolvimento;
- prefixo `__Host-` em produção;
- expiração por inatividade e limite absoluto de sessão;
- rate limiting persistente por username e, quando disponível de forma confiável, por IP;
- registro estruturado de eventos de segurança;
- resolução de contexto autenticado exclusivamente no servidor.

## 3. Credenciais e senhas

A credencial de autenticação é separada de `AppUser`.

Cada `AppUser` pode possuir no máximo uma credencial própria.

O username:

- é normalizado antes do uso;
- possui formato restrito;
- é único;
- não utiliza nome ou e-mail como identidade implícita.

Senhas são processadas com:

- HMAC-SHA256 usando `AUTH_PASSWORD_PEPPER` antes do Argon2id;
- Argon2id como algoritmo de derivação;
- salt aleatório gerado pela biblioteca;
- parâmetros definidos e versionados na aplicação.

O pepper:

- permanece somente no servidor;
- não é armazenado no banco;
- deve possuir pelo menos 32 bytes;
- não pode ser igual ao segredo utilizado para identificadores de rate limit.

Falhas de autenticação retornam mensagem genérica e não revelam se username, senha ou estado do usuário causaram a rejeição.

Quando a credencial não existe ou a entrada não pode representar uma credencial válida, a aplicação executa trabalho criptográfico dummy para reduzir diferenças observáveis no fluxo de autenticação.

## 4. Sessões

Uma autenticação válida cria uma sessão persistida em `auth_sessions`.

O token bruto:

- é gerado criptograficamente no servidor;
- possui 32 bytes aleatórios;
- não é persistido;
- não é exposto a Client Components;
- permanece restrito ao limite servidor/cookie.

O banco armazena somente o hash SHA-256 do token.

A sessão utiliza:

- 30 minutos de expiração por inatividade;
- 8 horas de duração absoluta;
- atualização de atividade após intervalo mínimo de 5 minutos;
- revogação explícita no logout;
- validação do estado `ACTIVE` do `AppUser`.

A atualização de atividade é condicional para impedir que callbacks atrasados reativem ou retrocedam o estado de uma sessão.

Falha na escrita do cookie após a criação da sessão aciona tentativa de compensação por revogação da sessão recém-criada.

## 5. Cookies

Em produção, a sessão utiliza o cookie:

`__Host-cartevy_session`

com:

- `HttpOnly`;
- `Secure`;
- `SameSite=Strict`;
- `Path=/`;
- ausência de `Domain`.

Em desenvolvimento local é utilizado `cartevy_session` sem `Secure`, permitindo execução por HTTP local.

O cookie não recebe duração persistente própria; a validade efetiva é determinada pela sessão server-side.

## 6. Rate limiting

A proteção contra tentativas repetidas é persistida em `auth_rate_limit_buckets`.

Identificadores brutos não são armazenados nos buckets.

Username e IP são representados por HMAC-SHA256 usando `AUTH_RATE_LIMIT_SECRET`.

O rate limiting por username reserva a tentativa antes da consulta da credencial e antes do trabalho Argon2id, usando transações `Serializable` com retry limitado para conflitos concorrentes.

A política atual de username utiliza progressão:

- quinta tentativa admitida cria bloqueio de 5 minutos para as seguintes;
- sexta tentativa admitida, após o bloqueio anterior, cria bloqueio de 15 minutos;
- sétima tentativa admitida cria bloqueio de 60 minutos;
- após o ciclo de 60 minutos, a contagem reinicia;
- antes da quinta tentativa, a janela normal é de 15 minutos;
- autenticação bem-sucedida remove o bucket de username.

A proteção por IP:

- é independente da proteção por username;
- é incrementada somente após falha;
- bloqueia após 20 falhas dentro da janela;
- utiliza bloqueio de 15 minutos.

A aplicação somente utiliza IP quando a origem puder ser considerada confiável.

Na implantação Vercel, `x-vercel-forwarded-for` é aceito quando `VERCEL=1`.

Outros headers encaminhados arbitrariamente não são tratados como fonte confiável de identidade de rede.

## 7. Eventos de segurança

Eventos de autenticação são registrados em `auth_security_events`.

O modelo possui tipos explícitos para eventos como:

- sucesso e falha de login;
- transição para rate limit;
- criação e revogação de sessão;
- logout;
- alteração de senha;
- habilitação ou desabilitação de conta;
- criação do usuário inicial por bootstrap.

Eventos pré-autenticação podem utilizar hashes de identificador e IP, evitando armazenamento dos respectivos valores brutos.

O modelo não aceita metadata arbitrária nessa etapa.

## 8. Contexto autenticado e autorização

A sessão válida é transformada em um `AuthContext` server-side contendo somente:

- `sessionId`;
- `appUserId`;
- `organizationId`;
- `name`.

A organização ativa é derivada do `AppUser` persistido e não de parâmetros fornecidos pelo cliente.

Rotas privadas utilizam `requireAuthContext()` como fronteira de autenticação.

Essa proteção de layout não substitui autorização nas operações de dados.

Services, Server Actions e consultas comerciais da Fase 5 em diante deverão utilizar a identidade autenticada e o `organizationId` do contexto server-side para aplicar autorização e isolamento.

## 9. RLS e acesso ao banco

RLS permanece habilitado nas tabelas da aplicação.

A autenticação própria não transforma a sessão do Cartevy em identidade da Data API do Supabase.

O Prisma continua utilizando conexão server-side com capacidade privilegiada no PostgreSQL.

Consequentemente:

- RLS não substitui autorização server-side;
- operações comerciais devem continuar aplicando explicitamente `organizationId`;
- não são consideradas implementadas policies RLS baseadas na sessão do usuário;
- eventual uso futuro de policies por identidade exigirá decisão própria e mecanismo compatível.

As tabelas específicas de autenticação também possuem RLS habilitado sem policies destinadas a acesso direto de clientes.

## 10. Segurança HTTP

A aplicação acrescenta proteção HTTP compatível com a autenticação, incluindo:

- remoção do header `X-Powered-By`;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `X-Frame-Options`;
- HSTS em produção;
- Content Security Policy;
- nonce server-side por request para scripts autorizados;
- `Cache-Control: private, no-store` nas respostas processadas pelo proxy.

Exceções necessárias ao ambiente de desenvolvimento não são carregadas para a política de produção.

## 11. Operação inicial

O primeiro usuário autenticável é criado por bootstrap controlado.

O bootstrap:

- exige `CARTEVY_ALLOW_AUTH_BOOTSTRAP=1`;
- exige terminal interativo;
- não aceita senha por argumento de linha de comando;
- é bloqueado quando já existe credencial;
- revalida a condição dentro de transação serializable.

Também existem utilitários controlados para:

- limpeza de sessões expiradas e buckets antigos;
- teste de persistência da autenticação contra PostgreSQL real.

Esses scripts não são executados automaticamente.

## 12. Persistência

A Fase 4 adicionou a migration:

`20260924_authentication_foundation`

Ela introduz:

- `auth_credentials`;
- `auth_sessions`;
- `auth_rate_limit_buckets`;
- `auth_security_events`;
- enums relacionados;
- constraints;
- índices;
- foreign keys;
- RLS nas tabelas de autenticação.

A migration também remove a referência legada `auth_user_id` de `app_users` e torna o e-mail cadastral opcional.

A migration foi aplicada e validada contra o PostgreSQL utilizado pelo projeto.

## 13. Justificativa

A autenticação própria foi adotada porque:

- mantém a identidade integrada ao domínio já existente do Cartevy;
- evita introduzir um segundo modelo de usuário sem necessidade imediata;
- permite controle explícito de sessão, rate limiting e eventos de segurança;
- mantém toda a implementação sensível no servidor;
- atende ao uso individual do MVP sem impedir evolução futura;
- integra-se diretamente à arquitetura Next.js e Prisma já adotada.

## 14. Impactos

### 14.1 Impactos positivos

- proteção efetiva das áreas internas;
- credenciais independentes de e-mail;
- sessões revogáveis no servidor;
- token bruto não persistido;
- proteção contra tentativas repetidas;
- contexto autenticado com organização derivada do banco;
- trilha de eventos de segurança;
- base para autorização das operações comerciais da Fase 5.

### 14.2 Limitações e compromissos

A implementação atual não inclui:

- cadastro público;
- recuperação automática de senha;
- administração completa de usuários;
- diferentes níveis de permissão;
- autenticação multifator;
- Turnstile ou mecanismo equivalente;
- policies RLS baseadas diretamente na sessão do Cartevy;
- scheduler automático para cleanup;
- retenção automática de eventos de segurança.

O uso inicial continua coerente com um único usuário operacional.

Recursos avançados de identidade deverão ser introduzidos somente quando requisitos reais justificarem sua complexidade.

## 15. Alternativas não adotadas nesta etapa

Não foram adotados como solução principal:

- Supabase Auth;
- autenticação terceirizada por provedor social;
- sessão exclusivamente stateless por JWT;
- armazenamento do token bruto da sessão no banco;
- armazenamento da sessão em Web Storage;
- autenticação exclusivamente no cliente;
- administração multiusuário completa durante o MVP inicial.

Essas alternativas poderão ser reavaliadas caso requisitos futuros justifiquem mudança.

## 16. Relação com outros documentos

Esta decisão complementa:

- `ADR-001 — Fundação Técnica Inicial da Aplicação`;
- `ADR-002 — Persistência PostgreSQL Gerenciada pelo Supabase`;
- `ARC-001 — Arquitetura da Aplicação`;
- `PRD-002 — Escopo do MVP`;
- `PRD-003 — Requisitos do Produto`;
- `PRD-004 — Roadmap do Produto`.

A decisão atende especialmente:

- `RF-001 — Autenticação`;
- `RF-002 — Proteção de áreas privadas`;
- `RF-026 — Manutenção de sessão`;
- `RNF-004 — Segurança`.

## 17. Estado da decisão

A decisão está aprovada e corresponde à implementação concluída na Fase 4 — Autenticação.

A autenticação própria, a persistência de sessões, o rate limiting e o contexto autenticado passam a integrar a arquitetura oficial do Cartevy CRM.

A autorização das operações do núcleo comercial deverá utilizar essa base a partir da Fase 5.
