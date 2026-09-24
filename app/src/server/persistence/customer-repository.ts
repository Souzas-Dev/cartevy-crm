import type {
  Customer,
  Prisma,
} from "@/generated/prisma/client";

import {
  CustomerIdentityConflictError,
} from "../services/errors";

type CustomerDb = Pick<
  Prisma.TransactionClient,
  "customer"
>;

export interface RegisteredCustomerSource {
  internalCode: string;
  name: string;
  document?: string;
  whatsapp?: string;
}

export async function findCustomerById(
  db: CustomerDb,
  organizationId: string,
  customerId: string,
): Promise<Customer | null> {
  return db.customer.findUnique({
    where: {
      id_organizationId: {
        id: customerId,
        organizationId,
      },
    },
  });
}

export async function findCustomerByInternalCode(
  db: CustomerDb,
  organizationId: string,
  internalCode: string,
): Promise<Customer | null> {
  return db.customer.findUnique({
    where: {
      organizationId_internalCode: {
        organizationId,
        internalCode,
      },
    },
  });
}

async function findCustomerByDocument(
  db: CustomerDb,
  organizationId: string,
  document: string,
): Promise<Customer | null> {
  return db.customer.findUnique({
    where: {
      organizationId_document: {
        organizationId,
        document,
      },
    },
  });
}

export async function resolveRegisteredCustomer(
  db: CustomerDb,
  organizationId: string,
  source: RegisteredCustomerSource,
): Promise<Customer | null> {
  const existing =
    await findCustomerByInternalCode(
      db,
      organizationId,
      source.internalCode,
    );

  const documentOwner =
    source.document
      ? await findCustomerByDocument(
          db,
          organizationId,
          source.document,
        )
      : null;

  if (!existing) {
    if (documentOwner) {
      throw new CustomerIdentityConflictError(
        "O documento recebido já pertence a outro cliente cadastrado.",
      );
    }

    return null;
  }

  if (
    documentOwner &&
    documentOwner.id !== existing.id
  ) {
    throw new CustomerIdentityConflictError(
      "Código interno e documento identificam clientes diferentes.",
    );
  }

  if (
    existing.document &&
    source.document &&
    existing.document !== source.document
  ) {
    throw new CustomerIdentityConflictError(
      "O documento recebido conflita com o cadastro existente.",
    );
  }

  const enrichment: {
    document?: string;
    whatsapp?: string;
  } = {};

  if (
    !existing.document &&
    source.document
  ) {
    enrichment.document = source.document;
  }

  if (
    !existing.whatsapp &&
    source.whatsapp
  ) {
    enrichment.whatsapp = source.whatsapp;
  }

  if (Object.keys(enrichment).length === 0) {
    return existing;
  }

  return db.customer.update({
    where: {
      id_organizationId: {
        id: existing.id,
        organizationId,
      },
    },
    data: enrichment,
  });
}
