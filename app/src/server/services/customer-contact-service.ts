import type {
  PrismaClient,
} from "@/generated/prisma/client";

import {
  customerContactUpdateSchema,
  type CustomerContactUpdateInput,
} from "@/domain/schemas";

import {
  findCustomerById,
} from "../persistence/customer-repository";
import {
  CustomerNotFoundError,
} from "./errors";

export async function updateCustomerContact(
  prisma: PrismaClient,
  organizationId: string,
  customerId: string,
  input: CustomerContactUpdateInput,
) {
  const data = customerContactUpdateSchema.parse(
    input,
  );

  const existing = await findCustomerById(
    prisma,
    organizationId,
    customerId,
  );

  if (!existing) {
    throw new CustomerNotFoundError();
  }

  return prisma.customer.update({
    where: {
      id_organizationId: {
        id: customerId,
        organizationId,
      },
    },
    data: {
      ...(data.whatsapp !== undefined
        ? { whatsapp: data.whatsapp }
        : {}),
      ...(data.observations !== undefined
        ? { observations: data.observations }
        : {}),
    },
  });
}
