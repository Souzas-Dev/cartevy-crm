import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import dotenv from "dotenv";

import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import {
  findCustomerById,
} from "../src/server/persistence/customer-repository";
import {
  persistConfirmedOrder,
} from "../src/server/services/confirmed-order-service";
import {
  updateCustomerContact,
} from "../src/server/services/customer-contact-service";
import {
  DuplicateOrderError,
} from "../src/server/services/errors";

dotenv.config({
  path: ".env.local",
});

const prisma = createPrismaClient();

const suffix = randomUUID()
  .replaceAll("-", "")
  .slice(0, 10);

let organizationAId: string | undefined;
let organizationBId: string | undefined;

function hasPrismaCode(
  error: unknown,
  code: string,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

try {
  console.log(
    "Criando fixtures temporárias de persistência...",
  );

  const organizationA =
    await prisma.organization.create({
      data: {
        name: `Integration A ${suffix}`,
        slug: `integration-a-${suffix}`,
      },
    });

  const organizationB =
    await prisma.organization.create({
      data: {
        name: `Integration B ${suffix}`,
        slug: `integration-b-${suffix}`,
      },
    });

  organizationAId = organizationA.id;
  organizationBId = organizationB.id;

  // ============================================================
  // VENDA SEM CADASTRO — CASO ROSA
  // ============================================================

  const rosaSale =
    await persistConfirmedOrder(
      prisma,
      {
        organizationId: organizationA.id,
        number: `ROSA-75081-${suffix}`,
        customer: {
          name: "Rosa Casagrande",
        },
        productsTotal: "680.90",
        discountTotal: "37.80",
        freightTotal: "5.00",
        grandTotal: "648.10",
        items: [
          {
            name:
              "LENCOL PAPEL 70CMX50M AMARELO PLUMAX",
            quantity: "20",
            unit: "UN",
          },
          {
            name:
              "COMP DE GAZE LIVIA 13F 7.5X7.5CM",
            quantity: "50",
            unit: "UN",
          },
        ],
      },
    );

  assert.equal(
    rosaSale.customerId,
    null,
  );

  assert.equal(
    rosaSale.customer,
    null,
  );

  assert.equal(
    rosaSale.customerName,
    "Rosa Casagrande",
  );

  assert.equal(
    rosaSale.items.length,
    2,
  );

  assert.equal(
    await prisma.customer.count({
      where: {
        organizationId:
          organizationA.id,
      },
    }),
    0,
    "Pedido sem código interno não pode criar Customer.",
  );

  assert.equal(
    await prisma.followUp.count({
      where: {
        organizationId:
          organizationA.id,
      },
    }),
    0,
    "Venda sem cadastro não pode gerar follow-up.",
  );

  // ============================================================
  // OUTRA ROSA, AGORA CADASTRADA
  //
  // Mesmo nome NÃO significa mesma pessoa.
  // Código interno cria a identidade formal do CRM.
  // ============================================================

  const registeredRosa =
    await persistConfirmedOrder(
      prisma,
      {
        organizationId:
          organizationA.id,

        number:
          `ROSA-CAD-1-${suffix}`,

        customer: {
          internalCode:
            `ROSA-${suffix}`,
          name:
            "Rosa Casagrande",
        },

        productsTotal:
          "100.00",

        grandTotal:
          "100.00",

        items: [
          {
            name:
              "PRODUTO CLIENTE CADASTRADO",
            quantity:
              "1",
            unit:
              "UN",
          },
        ],
      },
    );

  assert.ok(
    registeredRosa.customerId,
  );

  assert.ok(
    registeredRosa.customer,
  );

  assert.equal(
    await prisma.customer.count({
      where: {
        organizationId:
          organizationA.id,
      },
    }),
    1,
    "Rosa sem cadastro não pode ser mesclada com Rosa cadastrada.",
  );

  // ============================================================
  // ENRIQUECIMENTO
  //
  // Campos vazios podem ser completados pela origem.
  // Valores existentes nunca são substituídos.
  // ============================================================

  const enrichedRosa =
    await persistConfirmedOrder(
      prisma,
      {
        organizationId:
          organizationA.id,

        number:
          `ROSA-CAD-2-${suffix}`,

        customer: {
          internalCode:
            `ROSA-${suffix}`,

          name:
            "Rosa Casagrande",

          document:
            "12345678901",

          whatsapp:
            "67993360660",
        },

        productsTotal:
          "120.00",

        grandTotal:
          "120.00",

        items: [
          {
            name:
              "SEGUNDO PRODUTO",
            quantity:
              "1",
            unit:
              "UN",
          },
        ],
      },
    );

  assert.equal(
    enrichedRosa.customer?.id,
    registeredRosa.customer?.id,
  );

  const customerAfterEnrichment =
    await prisma.customer.findUniqueOrThrow({
      where: {
        id:
          registeredRosa.customer!.id,
      },
    });

  assert.equal(
    customerAfterEnrichment.document,
    "12345678901",
  );

  assert.equal(
    customerAfterEnrichment.whatsapp,
    "67993360660",
  );

  // Origem posterior tenta trazer outro WhatsApp.
  // O valor existente precisa ser preservado.
  const preservedCustomer =
    await persistConfirmedOrder(
      prisma,
      {
        organizationId:
          organizationA.id,

        number:
          `ROSA-CAD-3-${suffix}`,

        customer: {
          internalCode:
            `ROSA-${suffix}`,

          // Snapshot do pedido pode mudar.
          name:
            "ROSA CASAGRANDE",

          document:
            "12345678901",

          whatsapp:
            "67999999999",
        },

        productsTotal:
          "50.00",

        grandTotal:
          "50.00",

        items: [
          {
            name:
              "TERCEIRO PRODUTO",
            quantity:
              "1",
            unit:
              "UN",
          },
        ],
      },
    );

  assert.equal(
    preservedCustomer.customerName,
    "ROSA CASAGRANDE",
  );

  const customerAfterPreservation =
    await prisma.customer.findUniqueOrThrow({
      where: {
        id:
          registeredRosa.customer!.id,
      },
    });

  assert.equal(
    customerAfterPreservation.name,
    "Rosa Casagrande",
    "Nome existente não pode ser substituído silenciosamente.",
  );

  assert.equal(
    customerAfterPreservation.whatsapp,
    "67993360660",
    "WhatsApp existente não pode ser substituído pela origem.",
  );

  // ============================================================
  // ALTERAÇÃO MANUAL PERMITIDA
  // ============================================================

  const manuallyUpdated =
    await updateCustomerContact(
      prisma,
      organizationA.id,
      registeredRosa.customer!.id,
      {
        whatsapp:
          "(67) 98888-7777",

        observations:
          "Falar com Fulano no contato comercial.",
      },
    );

  assert.equal(
    manuallyUpdated.whatsapp,
    "67988887777",
  );

  assert.equal(
    manuallyUpdated.observations,
    "Falar com Fulano no contato comercial.",
  );

  // Um PDF posterior continua sem poder substituir
  // o WhatsApp alterado manualmente.
  await persistConfirmedOrder(
    prisma,
    {
      organizationId:
        organizationA.id,

      number:
        `ROSA-CAD-4-${suffix}`,

      customer: {
        internalCode:
          `ROSA-${suffix}`,

        name:
          "Rosa Casagrande",

        document:
          "12345678901",

        whatsapp:
          "67111111111",
      },

      productsTotal:
        "60.00",

      grandTotal:
        "60.00",

      items: [
        {
          name:
            "QUARTO PRODUTO",
          quantity:
            "1",
          unit:
            "UN",
        },
      ],
    },
  );

  const afterManualEdit =
    await prisma.customer.findUniqueOrThrow({
      where: {
        id:
          registeredRosa.customer!.id,
      },
    });

  assert.equal(
    afterManualEdit.whatsapp,
    "67988887777",
  );

  // ============================================================
  // DUPLICIDADE
  // ============================================================

  await assert.rejects(
    () =>
      persistConfirmedOrder(
        prisma,
        {
          organizationId:
            organizationA.id,

          number:
            `ROSA-CAD-1-${suffix}`,

          customer: {
            internalCode:
              `ROSA-${suffix}`,

            name:
              "Rosa Casagrande",
          },

          productsTotal:
            "100.00",

          grandTotal:
            "100.00",

          items: [
            {
              name:
                "PEDIDO DUPLICADO",
              quantity:
                "1",
              unit:
                "UN",
            },
          ],
        },
      ),

    (error) =>
      error instanceof
      DuplicateOrderError,
  );

  // ============================================================
  // OUTRA ORGANIZAÇÃO
  // ============================================================

  const orderB =
    await persistConfirmedOrder(
      prisma,
      {
        organizationId:
          organizationB.id,

        // O mesmo número pode existir
        // em outra organização futura.
        number:
          `ROSA-CAD-1-${suffix}`,

        customer: {
          internalCode:
            `B-${suffix}`,

          name:
            "Cliente Organização B",
        },

        productsTotal:
          "50.00",

        grandTotal:
          "50.00",

        items: [
          {
            name:
              "PRODUTO B",
            quantity:
              "1.5",
            unit:
              "KG",
          },
        ],
      },
    );

  assert.ok(
    orderB.customerId,
  );

  const crossTenantCustomer =
    await findCustomerById(
      prisma,
      organizationA.id,
      orderB.customer!.id,
    );

  assert.equal(
    crossTenantCustomer,
    null,
    "Consulta tenant-scoped não pode enxergar cliente de outra organização.",
  );

  // ============================================================
  // FK COMPOSTA
  // ============================================================

  let foreignKeyRejected = false;

  try {
    await prisma.order.create({
      data: {
        organizationId:
          organizationA.id,

        customerId:
          orderB.customer!.id,

        customerName:
          "Cliente Organização B",

        number:
          `INVALID-${suffix}`,

        productsTotal:
          "1.00",

        grandTotal:
          "1.00",
      },
    });
  }
  catch (error) {
    foreignKeyRejected =
      hasPrismaCode(
        error,
        "P2003",
      );
  }

  assert.equal(
    foreignKeyRejected,
    true,
    "Banco deve rejeitar relação cross-tenant.",
  );

  console.log("");
  console.log(
    "✓ venda sem cadastro persiste sem criar Customer",
  );
  console.log(
    "✓ venda sem cadastro permanece nos pedidos/indicadores",
  );
  console.log(
    "✓ nome não é usado para identidade",
  );
  console.log(
    "✓ cliente cadastrado exige código interno",
  );
  console.log(
    "✓ outra Rosa cadastrada vira Customer independente",
  );
  console.log(
    "✓ campos vazios são enriquecidos pela origem",
  );
  console.log(
    "✓ valores existentes não são sobrescritos",
  );
  console.log(
    "✓ edição manual de WhatsApp é preservada",
  );
  console.log(
    "✓ pedido confirmado duplicado é bloqueado",
  );
  console.log(
    "✓ venda sem Customer não gera follow-up",
  );
  console.log(
    "✓ cliente cadastrado mantém vínculo para fluxo de follow-up",
  );
  console.log(
    "✓ isolamento por organização preservado",
  );
  console.log(
    "✓ FK composta bloqueia relação cross-tenant",
  );
  console.log("");
  console.log(
    "Teste de persistência concluído com sucesso.",
  );
}
finally {
  const ids = [
    organizationAId,
    organizationBId,
  ].filter(
    (value): value is string =>
      value !== undefined,
  );

  if (ids.length > 0) {
    await prisma.backorder.deleteMany({
      where: {
        organizationId: {
          in: ids,
        },
      },
    });

    await prisma.followUp.deleteMany({
      where: {
        organizationId: {
          in: ids,
        },
      },
    });

    await prisma.orderItem.deleteMany({
      where: {
        organizationId: {
          in: ids,
        },
      },
    });

    await prisma.order.deleteMany({
      where: {
        organizationId: {
          in: ids,
        },
      },
    });

    await prisma.customer.deleteMany({
      where: {
        organizationId: {
          in: ids,
        },
      },
    });

    await prisma.appUser.deleteMany({
      where: {
        organizationId: {
          in: ids,
        },
      },
    });

    await prisma.organization.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  await prisma.$disconnect();
}
