import "server-only";

import type {
  PrismaClient,
} from "@/generated/prisma/client";

import {
  customerCreateSchema,
  type CustomerCreateInput,
} from "@/domain/schemas";

import {
  createCustomerRecord,
  findCustomerByDocument,
  findCustomerByInternalCode,
} from "../persistence/customer-repository";
import {
  CustomerIdentityConflictError,
} from "./errors";

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

export async function createCustomer(
  prisma: PrismaClient,
  organizationId: string,
  responsibleUserId: string | null,
  input: CustomerCreateInput,
) {
  const data = customerCreateSchema.parse(input);

  const existingByCode =
    await findCustomerByInternalCode(
      prisma,
      organizationId,
      data.internalCode,
    );

  if (existingByCode) {
    throw new CustomerIdentityConflictError(
      "Já existe um cliente com este código interno.",
    );
  }

  if (data.document) {
    const existingByDocument =
      await findCustomerByDocument(
        prisma,
        organizationId,
        data.document,
      );

    if (existingByDocument) {
      throw new CustomerIdentityConflictError(
        "Já existe um cliente com este documento.",
      );
    }
  }

  try {
    return await createCustomerRecord(
      prisma,
      organizationId,
      responsibleUserId,
      data,
    );
  }
  catch (error) {
    if (hasPrismaCode(error, "P2002")) {
      throw new CustomerIdentityConflictError(
        "Já existe um cliente com o código interno ou documento informado.",
      );
    }

    throw error;
  }
}
