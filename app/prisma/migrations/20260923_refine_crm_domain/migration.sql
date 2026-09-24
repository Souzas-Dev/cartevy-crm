-- Cartevy CRM
-- Refatoração do domínio comercial após validação com pedidos reais.
--
-- Esta migration preserva o histórico existente e ajusta o schema
-- para o MVP de uso individual, mantendo a fronteira organizacional
-- necessária para futura evolução multi-tenant.

-- ============================================================
-- Customer
-- ============================================================

DROP INDEX IF EXISTS "customers_organization_id_phone_idx";

ALTER TABLE "customers"
DROP CONSTRAINT IF EXISTS "customers_phone_format_check";

ALTER TABLE "customers"
RENAME COLUMN "phone" TO "whatsapp";

ALTER TABLE "customers"
RENAME COLUMN "notes" TO "observations";

CREATE INDEX "customers_organization_id_whatsapp_idx"
ON "customers"("organization_id", "whatsapp");

ALTER TABLE "customers"
ADD CONSTRAINT "customers_whatsapp_format_check"
CHECK (
  "whatsapp" IS NULL
  OR "whatsapp" ~ '^[0-9]{10,15}$'
);

-- ============================================================
-- Order
-- ============================================================

DROP INDEX IF EXISTS "orders_organization_id_ordered_at_idx";

ALTER TABLE "orders"
RENAME COLUMN "ordered_at" TO "imported_at";

ALTER TABLE "orders"
ALTER COLUMN "imported_at"
TYPE TIMESTAMPTZ(3)
USING ("imported_at"::timestamp AT TIME ZONE 'UTC');

ALTER TABLE "orders"
ALTER COLUMN "imported_at"
SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "orders"
ADD COLUMN "products_total" DECIMAL(14,2);

ALTER TABLE "orders"
ADD COLUMN "discount_total" DECIMAL(14,2) NOT NULL DEFAULT 0;

ALTER TABLE "orders"
ADD COLUMN "freight_total" DECIMAL(14,2) NOT NULL DEFAULT 0;

-- Compatibilidade com qualquer registro criado antes desta migration:
-- o total anterior é preservado como total geral e também utilizado
-- como valor inicial de produtos.
UPDATE "orders"
SET "products_total" = "total"
WHERE "products_total" IS NULL;

ALTER TABLE "orders"
ALTER COLUMN "products_total"
SET NOT NULL;

ALTER TABLE "orders"
DROP COLUMN "origin";

ALTER TABLE "orders"
DROP COLUMN "notes";

DROP TYPE "OrderOrigin";

CREATE INDEX "orders_organization_id_imported_at_idx"
ON "orders"("organization_id", "imported_at");

ALTER TABLE "orders"
ADD CONSTRAINT "orders_products_total_nonnegative_check"
CHECK ("products_total" >= 0);

ALTER TABLE "orders"
ADD CONSTRAINT "orders_discount_total_nonnegative_check"
CHECK ("discount_total" >= 0);

ALTER TABLE "orders"
ADD CONSTRAINT "orders_freight_total_nonnegative_check"
CHECK ("freight_total" >= 0);

-- ============================================================
-- Order items
-- ============================================================

CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey"
    PRIMARY KEY ("id")
);

CREATE INDEX "order_items_organization_id_order_id_idx"
ON "order_items"("organization_id", "order_id");

CREATE INDEX "order_items_order_id_organization_id_idx"
ON "order_items"("order_id", "organization_id");

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_organization_id_fkey"
FOREIGN KEY ("organization_id")
REFERENCES "organizations"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_order_id_organization_id_fkey"
FOREIGN KEY ("order_id", "organization_id")
REFERENCES "orders"("id", "organization_id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_name_not_blank_check"
CHECK (btrim("name") <> '');

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_unit_not_blank_check"
CHECK (btrim("unit") <> '');

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_quantity_positive_check"
CHECK ("quantity" > 0);

ALTER TABLE "order_items"
ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy é criada nesta fase.
-- Policies baseadas em identidade continuam reservadas à Fase 4.
