-- Cartevy CRM
-- Pedidos de clientes sem cadastro formal.
--
-- Regra:
-- - todo pedido persiste o nome apresentado no documento;
-- - customer_id é opcional;
-- - somente pedidos associados a Customer entram no fluxo
--   de histórico comercial/follow-up;
-- - nome não é utilizado como identidade de cliente.

ALTER TABLE "orders"
ADD COLUMN "customer_name" VARCHAR(200);

-- Compatibilidade defensiva com pedidos que eventualmente
-- existissem antes desta migration.
UPDATE "orders" AS "o"
SET "customer_name" = "c"."name"
FROM "customers" AS "c"
WHERE
  "o"."customer_id" = "c"."id"
  AND "o"."organization_id" = "c"."organization_id"
  AND "o"."customer_name" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "orders"
    WHERE
      "customer_name" IS NULL
      OR btrim("customer_name") = ''
  ) THEN
    RAISE EXCEPTION
      'Não é possível tornar customer_name obrigatório: existem pedidos sem nome de cliente.';
  END IF;
END
$$;

ALTER TABLE "orders"
ALTER COLUMN "customer_name"
SET NOT NULL;

ALTER TABLE "orders"
ALTER COLUMN "customer_id"
DROP NOT NULL;

ALTER TABLE "orders"
ADD CONSTRAINT "orders_customer_name_not_blank_check"
CHECK (btrim("customer_name") <> '');
