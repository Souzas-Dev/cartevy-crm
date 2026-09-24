-- Cartevy CRM: fundação de persistência da autenticação própria.
-- Somente estrutura; não cria usuários, credenciais, sessões ou policies.
-- UUIDs e updated_at são preenchidos pelo Prisma, conforme @default(uuid())
-- e @updatedAt e o padrão das migrations anteriores.

BEGIN;

-- Identidade externa legada removida; email permanece apenas cadastral.
-- A unique (organization_id, email) é preservada e permite múltiplos NULLs.
DROP INDEX "app_users_auth_user_id_key";
ALTER TABLE "app_users" DROP COLUMN "auth_user_id";
ALTER TABLE "app_users" ALTER COLUMN "email" DROP NOT NULL;

CREATE TYPE "AuthRateLimitScope" AS ENUM ('USERNAME', 'IP');
CREATE TYPE "AuthSecurityEventType" AS ENUM (
    'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGIN_RATE_LIMITED',
    'SESSION_CREATED', 'SESSION_REVOKED', 'LOGOUT', 'PASSWORD_CHANGED',
    'ACCOUNT_DISABLED', 'ACCOUNT_ENABLED', 'BOOTSTRAP_USER_CREATED'
);

CREATE TABLE "auth_credentials" (
    "id" UUID NOT NULL,
    "app_user_id" UUID NOT NULL,
    "username" VARCHAR(40) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "auth_credentials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auth_credentials_username_format_check"
      CHECK ("username" COLLATE "C" ~ '^[a-z0-9._-]{3,40}$'),
    CONSTRAINT "auth_credentials_password_hash_not_blank_check"
      CHECK (btrim("password_hash") <> '')
);

CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "app_user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idle_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "absolute_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auth_sessions_token_hash_format_check"
      CHECK ("token_hash" COLLATE "C" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "auth_sessions_absolute_expiry_check"
      CHECK ("absolute_expires_at" > "created_at"),
    CONSTRAINT "auth_sessions_idle_expiry_check"
      CHECK ("idle_expires_at" > "created_at"),
    CONSTRAINT "auth_sessions_expiry_order_check"
      CHECK ("idle_expires_at" <= "absolute_expires_at"),
    CONSTRAINT "auth_sessions_last_seen_check"
      CHECK ("last_seen_at" >= "created_at"),
    CONSTRAINT "auth_sessions_revocation_check"
      CHECK ("revoked_at" IS NULL OR "revoked_at" >= "created_at")
);

-- key_hash receberá futuramente HMAC-SHA256 com AUTH_RATE_LIMIT_SECRET
-- sobre username canônico ou IP. Nenhum identificador bruto é armazenado.
CREATE TABLE "auth_rate_limit_buckets" (
    "id" UUID NOT NULL,
    "scope" "AuthRateLimitScope" NOT NULL,
    "key_hash" CHAR(64) NOT NULL,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "window_started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_failure_at" TIMESTAMPTZ(3),
    "blocked_until" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "auth_rate_limit_buckets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auth_rate_limit_buckets_key_hash_format_check"
      CHECK ("key_hash" COLLATE "C" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "auth_rate_limit_buckets_failure_count_check"
      CHECK ("failure_count" >= 0)
);

CREATE TABLE "auth_security_events" (
    "id" UUID NOT NULL,
    "app_user_id" UUID,
    "type" "AuthSecurityEventType" NOT NULL,
    "identifier_hash" CHAR(64),
    "ip_hash" CHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_security_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auth_security_events_identifier_hash_format_check"
      CHECK ("identifier_hash" IS NULL OR "identifier_hash" COLLATE "C" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "auth_security_events_ip_hash_format_check"
      CHECK ("ip_hash" IS NULL OR "ip_hash" COLLATE "C" ~ '^[0-9a-f]{64}$')
);

CREATE UNIQUE INDEX "auth_credentials_app_user_id_key" ON "auth_credentials"("app_user_id");
CREATE UNIQUE INDEX "auth_credentials_username_key" ON "auth_credentials"("username");
CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions"("token_hash");
CREATE UNIQUE INDEX "auth_rate_limit_buckets_scope_key_hash_key" ON "auth_rate_limit_buckets"("scope", "key_hash");

CREATE INDEX "auth_sessions_app_user_id_idx" ON "auth_sessions"("app_user_id");
CREATE INDEX "auth_sessions_app_user_id_revoked_at_idx" ON "auth_sessions"("app_user_id", "revoked_at");
CREATE INDEX "auth_sessions_idle_expires_at_idx" ON "auth_sessions"("idle_expires_at");
CREATE INDEX "auth_sessions_absolute_expires_at_idx" ON "auth_sessions"("absolute_expires_at");
CREATE INDEX "auth_security_events_created_at_idx" ON "auth_security_events"("created_at");
CREATE INDEX "auth_security_events_type_created_at_idx" ON "auth_security_events"("type", "created_at");
CREATE INDEX "auth_security_events_app_user_id_created_at_idx" ON "auth_security_events"("app_user_id", "created_at");

ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_app_user_id_fkey"
  FOREIGN KEY ("app_user_id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_app_user_id_fkey"
  FOREIGN KEY ("app_user_id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "auth_security_events" ADD CONSTRAINT "auth_security_events_app_user_id_fkey"
  FOREIGN KEY ("app_user_id") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS sem policies: anon/authenticated não recebem acesso às linhas pela Data API.
-- Papéis privilegiados com BYPASSRLS continuam restritos ao servidor.
ALTER TABLE "auth_credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_rate_limit_buckets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_security_events" ENABLE ROW LEVEL SECURITY;

COMMIT;
