-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppUserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrderOrigin" AS ENUM ('MANUAL', 'PDF_IMPORT', 'TELEGRAM', 'LOCAL_MONITOR', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BackorderStatus" AS ENUM ('WAITING_PRODUCT', 'PRODUCT_AVAILABLE', 'CUSTOMER_NOTIFIED', 'COMPLETED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_users" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "auth_user_id" UUID,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "status" "AppUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "responsible_user_id" UUID,
    "internal_code" VARCHAR(80),
    "name" VARCHAR(200) NOT NULL,
    "document" VARCHAR(14),
    "phone" VARCHAR(15),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "responsible_user_id" UUID,
    "number" VARCHAR(100) NOT NULL,
    "ordered_at" DATE NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "origin" "OrderOrigin" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "order_id" UUID,
    "responsible_user_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "notes" TEXT,
    "due_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backorders" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "responsible_user_id" UUID,
    "description" VARCHAR(500) NOT NULL,
    "estimated_at" DATE,
    "notes" TEXT,
    "status" "BackorderStatus" NOT NULL DEFAULT 'WAITING_PRODUCT',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "backorders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_auth_user_id_key" ON "app_users"("auth_user_id");

-- CreateIndex
CREATE INDEX "app_users_organization_id_status_idx" ON "app_users"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_organization_id_email_key" ON "app_users"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_id_organization_id_key" ON "app_users"("id", "organization_id");

-- CreateIndex
CREATE INDEX "customers_organization_id_phone_idx" ON "customers"("organization_id", "phone");

-- CreateIndex
CREATE INDEX "customers_organization_id_name_idx" ON "customers"("organization_id", "name");

-- CreateIndex
CREATE INDEX "customers_organization_id_responsible_user_id_idx" ON "customers"("organization_id", "responsible_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_organization_id_key" ON "customers"("id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organization_id_internal_code_key" ON "customers"("organization_id", "internal_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organization_id_document_key" ON "customers"("organization_id", "document");

-- CreateIndex
CREATE INDEX "orders_organization_id_customer_id_idx" ON "orders"("organization_id", "customer_id");

-- CreateIndex
CREATE INDEX "orders_organization_id_responsible_user_id_idx" ON "orders"("organization_id", "responsible_user_id");

-- CreateIndex
CREATE INDEX "orders_organization_id_ordered_at_idx" ON "orders"("organization_id", "ordered_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_organization_id_key" ON "orders"("id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_organization_id_number_key" ON "orders"("organization_id", "number");

-- CreateIndex
CREATE INDEX "follow_ups_organization_id_customer_id_idx" ON "follow_ups"("organization_id", "customer_id");

-- CreateIndex
CREATE INDEX "follow_ups_organization_id_order_id_idx" ON "follow_ups"("organization_id", "order_id");

-- CreateIndex
CREATE INDEX "follow_ups_organization_id_responsible_user_id_idx" ON "follow_ups"("organization_id", "responsible_user_id");

-- CreateIndex
CREATE INDEX "follow_ups_organization_id_status_due_at_idx" ON "follow_ups"("organization_id", "status", "due_at");

-- CreateIndex
CREATE INDEX "backorders_organization_id_order_id_idx" ON "backorders"("organization_id", "order_id");

-- CreateIndex
CREATE INDEX "backorders_organization_id_responsible_user_id_idx" ON "backorders"("organization_id", "responsible_user_id");

-- CreateIndex
CREATE INDEX "backorders_organization_id_status_idx" ON "backorders"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_responsible_user_id_organization_id_fkey" FOREIGN KEY ("responsible_user_id", "organization_id") REFERENCES "app_users"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_organization_id_fkey" FOREIGN KEY ("customer_id", "organization_id") REFERENCES "customers"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_responsible_user_id_organization_id_fkey" FOREIGN KEY ("responsible_user_id", "organization_id") REFERENCES "app_users"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_customer_id_organization_id_fkey" FOREIGN KEY ("customer_id", "organization_id") REFERENCES "customers"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_order_id_organization_id_fkey" FOREIGN KEY ("order_id", "organization_id") REFERENCES "orders"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_responsible_user_id_organization_id_fkey" FOREIGN KEY ("responsible_user_id", "organization_id") REFERENCES "app_users"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backorders" ADD CONSTRAINT "backorders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backorders" ADD CONSTRAINT "backorders_order_id_organization_id_fkey" FOREIGN KEY ("order_id", "organization_id") REFERENCES "orders"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backorders" ADD CONSTRAINT "backorders_responsible_user_id_organization_id_fkey" FOREIGN KEY ("responsible_user_id", "organization_id") REFERENCES "app_users"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Cartevy CRM
-- Integridade adicional não representada diretamente no
-- Prisma Schema.
-- ============================================================

-- CPF/CNPJ devem persistir somente em formato normalizado.
ALTER TABLE "customers"
ADD CONSTRAINT "customers_document_format_check"
CHECK (
  "document" IS NULL
  OR "document" ~ '^(?:[0-9]{11}|[0-9]{14})$'
);

-- Telefones também são persistidos normalizados.
ALTER TABLE "customers"
ADD CONSTRAINT "customers_phone_format_check"
CHECK (
  "phone" IS NULL
  OR "phone" ~ '^[0-9]{10,15}$'
);

-- Pedido não pode possuir total negativo.
ALTER TABLE "orders"
ADD CONSTRAINT "orders_total_nonnegative_check"
CHECK ("total" >= 0);

-- Estado e data de conclusão do follow-up precisam ser coerentes.
ALTER TABLE "follow_ups"
ADD CONSTRAINT "follow_ups_completion_consistency_check"
CHECK (
  (
    "status" = 'PENDING'
    AND "completed_at" IS NULL
  )
  OR
  (
    "status" = 'COMPLETED'
    AND "completed_at" IS NOT NULL
  )
);

-- ============================================================
-- Row Level Security
--
-- RLS nasce habilitado em todas as tabelas da aplicação.
-- Nenhuma policy é criada nesta fase.
--
-- Resultado:
-- Data API / anon / authenticated não ganham acesso aos dados
-- até a política de autenticação/autorização da Fase 4.
-- ============================================================

ALTER TABLE "organizations"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "app_users"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "customers"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "orders"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "follow_ups"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "backorders"
ENABLE ROW LEVEL SECURITY;
