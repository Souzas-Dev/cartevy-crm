# Autenticação própria — operação técnica

Configuração é lazy/server-only. AUTH_PASSWORD_PEPPER e AUTH_RATE_LIMIT_SECRET
precisam ter pelo menos 32 bytes UTF-8, não podem ser whitespace-only e devem ser
distintos. Os valores válidos não são aparados, normalizados ou truncados. Usar
segredos aleatórios mantidos fora do Git. Bootstrap exige somente o pepper, com a
mesma validação de tamanho. Troca de pepper exige estratégia de troca de senhas;
troca do segredo de identificadores muda a identidade dos buckets existentes.

Dummy: encoded Argon2id público fixo, com os mesmos parâmetros do hash real.
Cada chamada executa uma única verificação com a mesma preparação HMAC e ignora
o resultado. Não gera hash em runtime nem mantém pepper em cache.

Sessões: cookie HttpOnly, SameSite=Strict, Path=/, sem Domain ou persistência longa.
Produção usa __Host-cartevy_session e Secure; somente NODE_ENV=development usa
cartevy_session sem Secure. Idle de 30 minutos, máximo absoluto de 8 horas; touch
via after(), a cada pelo menos 5 minutos, com UPDATE condicional. Somente SHA-256
do token é persistido. O token bruto permanece transitoriamente no servidor/cookie.

USERNAME: uma transação serializable curta reserva a tentativa ANTES de consultar
credenciais ou executar Argon2, com retry limitado de conflitos. Ela termina antes
do trabalho criptográfico. Contagem reservada não é incrementada de novo na falha;
se o processo morrer, a reserva conta conservadoramente. Tentativas 1–4 são livres;
5 é admitida e bloqueia as seguintes por 5 minutos. Após esse bloqueio, 6 é admitida
e bloqueia por 15 minutos; depois, 7 é admitida e bloqueia por 60 minutos. Após os
60 minutos, a próxima inicia em 1. Antes de 5, a janela normal de 15 minutos reseta
a contagem. Bloqueios ativos não estendem prazo nem contador. Sucesso apaga USERNAME.
O bloqueio criado pela própria reserva não impede a tentativa admitida de concluir.

A reserva impede que novas tentativas do mesmo username ultrapassem a admissão
após ativação do bloqueio, inclusive entre instâncias que compartilham o banco.
Até cinco tentativas inicialmente admitidas podem executar Argon2 em paralelo;
sucesso reseta o ciclo. Não há distributed lock nem transação aberta durante Argon2.
IP é independente: incrementa somente na falha; a falha 20 bloqueia por 15 minutos.
Sucesso não reseta IP. Há precheck e recheck de IP antes de criar a sessão. Spray
entre muitos usernames/IPs e tentativas de IP já em andamento em múltiplas instâncias
continuam riscos residuais; proteção de infraestrutura e Turnstile são camadas futuras.

LOGIN_FAILURE registra a falha efetiva. LOGIN_RATE_LIMITED ocorre somente quando
essa falha corresponde a uma nova transição de bloqueio (USERNAME 5/6/7 ou IP 20),
no máximo uma vez por tentativa mesmo se ambos transitarem. Requests já bloqueadas
não executam Argon2 nem criam eventos. Uma reserva abandonada por crash pode não
ter evento de falha, mas conserva a proteção persistida. Eventos têm campos fixos,
sem metadata arbitrária ou valores brutos pré-auth.

Falha ao escrever cookie tenta revogar a sessão recém-emitida e registrar somente
SESSION_REVOKED, sem LOGOUT; também tenta limpar o cookie. Falha da compensação
registra apenas código operacional estável e deixa os expiries como limite residual.
Logout revalida a sessão pelo cookie; numa indisponibilidade do banco remove o cookie
e registra código operacional. Monitorar [cartevy.auth], sem anexar payloads/erros.

Somente VERCEL=1 confia em x-vercel-forwarded-for. Outros ambientes de produção
usam apenas USERNAME até haver integração com um proxy confiável. Não configurar
VERCEL=1 artificialmente fora da plataforma. AuthContext deriva organização do
AppUser. Futuras actions/consultas comerciais devem usar requireAuthContext e seu
organizationId; o layout não substitui essa autorização. Web Storage é usado
exclusivamente para a preferência visual crm-theme, nunca autenticação.

Scripts não são executados automaticamente. Executar manualmente de app após revisão:
- auth:bootstrap requer CARTEVY_ALLOW_AUTH_BOOTSTRAP=1 e terminal interativo; coleta
  organização/usuário/senha sem eco ou argumentos de senha. Aborta se existir credencial
  e revalida numa transação serializable antes de criar tudo. Não executar em CI.
- auth:cleanup requer CARTEVY_ALLOW_AUTH_CLEANUP=1. Remove sessões expiradas ou
  revogadas há pelo menos 7 dias e buckets sem bloqueio ativo cujo updatedAt seja
  anterior a 24 horas. Reporta as duas contagens separadas. Não há scheduler.
- test:auth:persistence requer CARTEVY_ALLOW_AUTH_INTEGRATION=1; cria dados sintéticos
  e limpa por IDs em finally. Muta o banco e exige autorização.

AuthSecurityEvent não tem retenção/limpeza automática nesta fase; política futura.
Os scripts usam condição Node react-server para consumir server-only; Next impõe
fronteira client/server normalmente. Testes unitários não se conectam ao banco.
Não há cadastro, recuperação de senha ou Turnstile. O encerramento documental da
Fase 4 permanece separado da documentação técnica deste código.
