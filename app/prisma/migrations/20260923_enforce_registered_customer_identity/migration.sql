-- Cartevy CRM
-- Hardening da identidade formal do cliente.
--
-- Regra de domínio:
-- - pedido sem código interno é uma venda sem Customer;
-- - todo registro existente em customers representa um cliente
--   formalmente cadastrado na loja e, portanto, possui internal_code.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "customers"
    WHERE
      "internal_code" IS NULL
      OR btrim("internal_code") = ''
  ) THEN
    RAISE EXCEPTION
      'Existem clientes sem código interno; hardening interrompido.';
  END IF;
END
$$;

ALTER TABLE "customers"
ALTER COLUMN "internal_code"
SET NOT NULL;

ALTER TABLE "customers"
ADD CONSTRAINT "customers_internal_code_not_blank_check"
CHECK (btrim("internal_code") <> '');
