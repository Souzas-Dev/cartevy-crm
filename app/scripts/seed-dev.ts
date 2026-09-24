import dotenv from "dotenv";

import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import { persistConfirmedOrder } from "../src/server/services/confirmed-order-service";

dotenv.config({
  path: ".env.local",
});

if (process.env.CARTEVY_ALLOW_SEED !== "1") {
  throw new Error(
    "Seed bloqueado. Defina CARTEVY_ALLOW_SEED=1 explicitamente para executar.",
  );
}

const prisma = createPrismaClient();

try {
  const organization =
    await prisma.organization.upsert({
      where: {
        slug: "cartevy-development",
      },
      update: {},
      create: {
        name: "Cartevy Development",
        slug: "cartevy-development",
      },
    });

  const existingOrder =
    await prisma.order.findUnique({
      where: {
        organizationId_number: {
          organizationId: organization.id,
          number: "SEED-0001",
        },
      },
    });

  if (existingOrder) {
    console.log(
      "Seed já existe. Nenhuma duplicação foi criada.",
    );
  }
  else {
    await persistConfirmedOrder(prisma, {
      organizationId: organization.id,
      number: "SEED-0001",
      customer: {
        internalCode: "DEMO-001",
        name: "Cliente Demonstração",
      },
      productsTotal: "100.00",
      discountTotal: "10.00",
      freightTotal: "5.00",
      grandTotal: "95.00",
      items: [
        {
          name: "Produto Demonstração",
          quantity: "2",
          unit: "UN",
        },
      ],
    });

    console.log(
      "Seed sintético criado com sucesso.",
    );
  }
}
finally {
  await prisma.$disconnect();
}
