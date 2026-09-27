import type {
  Customer,
  PrismaClient,
} from "@/generated/prisma/client";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createCustomerRecord,
  findCustomerByDocument,
  findCustomerByInternalCode,
} from "@/server/persistence/customer-repository";
import {
  CustomerIdentityConflictError,
} from "@/server/services/errors";
import {
  createCustomer,
} from "@/server/services/customer-registration-service";

vi.mock(
  "@/server/persistence/customer-repository",
  () => ({
    createCustomerRecord: vi.fn(),
    findCustomerByDocument: vi.fn(),
    findCustomerByInternalCode: vi.fn(),
  }),
);

const db = {} as PrismaClient;

const organizationId =
  "11111111-1111-4111-8111-111111111111";

const userId =
  "22222222-2222-4222-8222-222222222222";

const customer: Customer = {
  id: "33333333-3333-4333-8333-333333333333",
  organizationId,
  responsibleUserId: userId,
  internalCode: "C-100",
  name: "Cliente Teste",
  document: "12345678901",
  whatsapp: "67999990000",
  observations: "Contato principal.",
  createdAt: new Date("2026-09-27T12:00:00Z"),
  updatedAt: new Date("2026-09-27T12:00:00Z"),
};

describe("createCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      findCustomerByInternalCode,
    ).mockResolvedValue(null);
    vi.mocked(
      findCustomerByDocument,
    ).mockResolvedValue(null);
    vi.mocked(
      createCustomerRecord,
    ).mockResolvedValue(customer);
  });

  it("normaliza os dados e preserva o contexto server-side", async () => {
    await createCustomer(
      db,
      organizationId,
      userId,
      {
        internalCode: " C-100 ",
        name: " Cliente Teste ",
        document: "123.456.789-01",
        whatsapp: "(67) 99999-0000",
        observations: " Contato principal. ",
      },
    );

    expect(
      findCustomerByInternalCode,
    ).toHaveBeenCalledWith(
      db,
      organizationId,
      "C-100",
    );

    expect(
      createCustomerRecord,
    ).toHaveBeenCalledWith(
      db,
      organizationId,
      userId,
      {
        internalCode: "C-100",
        name: "Cliente Teste",
        document: "12345678901",
        whatsapp: "67999990000",
        observations: "Contato principal.",
      },
    );
  });

  it("recusa código interno já existente na organização", async () => {
    vi.mocked(
      findCustomerByInternalCode,
    ).mockResolvedValue(customer);

    await expect(
      createCustomer(
        db,
        organizationId,
        userId,
        {
          internalCode: "C-100",
          name: "Outro cliente",
        },
      ),
    ).rejects.toBeInstanceOf(
      CustomerIdentityConflictError,
    );

    expect(
      createCustomerRecord,
    ).not.toHaveBeenCalled();
  });

  it("recusa documento já associado a outro cliente", async () => {
    vi.mocked(
      findCustomerByDocument,
    ).mockResolvedValue(customer);

    await expect(
      createCustomer(
        db,
        organizationId,
        userId,
        {
          internalCode: "C-101",
          name: "Outro cliente",
          document: "12345678901",
        },
      ),
    ).rejects.toBeInstanceOf(
      CustomerIdentityConflictError,
    );

    expect(
      createCustomerRecord,
    ).not.toHaveBeenCalled();
  });

  it("traduz corrida de unicidade em conflito de identidade", async () => {
    vi.mocked(
      createCustomerRecord,
    ).mockRejectedValue({
      code: "P2002",
    });

    await expect(
      createCustomer(
        db,
        organizationId,
        userId,
        {
          internalCode: "C-101",
          name: "Cliente concorrente",
        },
      ),
    ).rejects.toBeInstanceOf(
      CustomerIdentityConflictError,
    );
  });
});
