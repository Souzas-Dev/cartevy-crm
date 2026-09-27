import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import dotenv from "dotenv";

import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import {
  listCustomers,
} from "../src/server/persistence/customer-repository";
import {
  updateCustomerContact,
} from "../src/server/services/customer-contact-service";
import {
  createCustomer,
} from "../src/server/services/customer-registration-service";
import {
  CustomerIdentityConflictError,
  CustomerNotFoundError,
} from "../src/server/services/errors";

dotenv.config({
  path: ".env.local",
  quiet: true,
});

const db = createPrismaClient();

const suffix = randomUUID().slice(0, 8);
const organizationSlugs = [
  `ci-customers-a-${suffix}`,
  `ci-customers-b-${suffix}`,
];

async function cleanup(): Promise<void> {
  const organizations =
    await db.organization.findMany({
      where: {
        slug: {
          in: organizationSlugs,
        },
      },
      select: {
        id: true,
      },
    });

  const organizationIds =
    organizations.map(
      (organization) => organization.id,
    );

  if (organizationIds.length > 0) {
    await db.customer.deleteMany({
      where: {
        organizationId: {
          in: organizationIds,
        },
      },
    });

    await db.organization.deleteMany({
      where: {
        id: {
          in: organizationIds,
        },
      },
    });
  }
}

async function main(): Promise<void> {
  await cleanup();

  try {
    const organizationA =
      await db.organization.create({
        data: {
          name: "CI Customers A",
          slug: organizationSlugs[0],
        },
      });

    const organizationB =
      await db.organization.create({
        data: {
          name: "CI Customers B",
          slug: organizationSlugs[1],
        },
      });

    const customerA = await createCustomer(
      db,
      organizationA.id,
      null,
      {
        internalCode: " C-100 ",
        name: " Cliente Integração ",
        document: "123.456.789-01",
        whatsapp: "(67) 99999-0000",
        observations: " Primeiro contato. ",
      },
    );

    assert.equal(
      customerA.organizationId,
      organizationA.id,
    );
    assert.equal(
      customerA.internalCode,
      "C-100",
    );
    assert.equal(
      customerA.name,
      "Cliente Integração",
    );
    assert.equal(
      customerA.document,
      "12345678901",
    );
    assert.equal(
      customerA.whatsapp,
      "67999990000",
    );

    const listA = await listCustomers(
      db,
      organizationA.id,
    );

    assert.deepEqual(
      listA.map((customer) => customer.id),
      [customerA.id],
    );

    const listBeforeB = await listCustomers(
      db,
      organizationB.id,
    );

    assert.equal(
      listBeforeB.length,
      0,
    );

    await assert.rejects(
      updateCustomerContact(
        db,
        organizationB.id,
        customerA.id,
        {
          whatsapp: "67988887777",
        },
      ),
      CustomerNotFoundError,
    );

    const updated = await updateCustomerContact(
      db,
      organizationA.id,
      customerA.id,
      {
        whatsapp: "67 98888-7777",
        observations: " Retorno confirmado. ",
      },
    );

    assert.equal(
      updated.whatsapp,
      "67988887777",
    );
    assert.equal(
      updated.observations,
      "Retorno confirmado.",
    );

    await assert.rejects(
      createCustomer(
        db,
        organizationA.id,
        null,
        {
          internalCode: "C-100",
          name: "Código duplicado",
        },
      ),
      CustomerIdentityConflictError,
    );

    await assert.rejects(
      createCustomer(
        db,
        organizationA.id,
        null,
        {
          internalCode: "C-101",
          name: "Documento duplicado",
          document: "12345678901",
        },
      ),
      CustomerIdentityConflictError,
    );

    const customerB = await createCustomer(
      db,
      organizationB.id,
      null,
      {
        internalCode: "C-100",
        name: "Cliente outra organização",
        document: "12345678901",
      },
    );

    assert.equal(
      customerB.organizationId,
      organizationB.id,
    );

    const listB = await listCustomers(
      db,
      organizationB.id,
    );

    assert.deepEqual(
      listB.map((customer) => customer.id),
      [customerB.id],
    );

    console.info(
      "Customer persistence integration: OK",
    );
  }
  finally {
    await cleanup();
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    "Customer persistence integration: FAILED",
  );

  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode = 1;
});
