-- Cartevy CRM
-- Hardening de persistência após a migration inicial.

-- ------------------------------------------------------------
-- Protege a tabela interna de histórico do Prisma contra
-- acesso pela Data API.
--
-- Nenhuma policy é criada intencionalmente.
-- O backend/migrations usa o papel postgres, que possui
-- BYPASSRLS neste projeto.
-- ------------------------------------------------------------

ALTER TABLE "public"."_prisma_migrations"
ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Índices de suporte às foreign keys compostas.
--
-- Os índices tenant-first já existentes são mantidos para
-- consultas que começam por organization_id.
-- Estes índices seguem exatamente a ordem das colunas das FKs.
-- ------------------------------------------------------------

CREATE INDEX "customers_responsible_user_id_organization_id_idx"
ON "public"."customers"("responsible_user_id", "organization_id");

CREATE INDEX "orders_customer_id_organization_id_idx"
ON "public"."orders"("customer_id", "organization_id");

CREATE INDEX "orders_responsible_user_id_organization_id_idx"
ON "public"."orders"("responsible_user_id", "organization_id");

CREATE INDEX "follow_ups_customer_id_organization_id_idx"
ON "public"."follow_ups"("customer_id", "organization_id");

CREATE INDEX "follow_ups_order_id_organization_id_idx"
ON "public"."follow_ups"("order_id", "organization_id");

CREATE INDEX "follow_ups_responsible_user_id_organization_id_idx"
ON "public"."follow_ups"("responsible_user_id", "organization_id");

CREATE INDEX "backorders_order_id_organization_id_idx"
ON "public"."backorders"("order_id", "organization_id");

CREATE INDEX "backorders_responsible_user_id_organization_id_idx"
ON "public"."backorders"("responsible_user_id", "organization_id");
