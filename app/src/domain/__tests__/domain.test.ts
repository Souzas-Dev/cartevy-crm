import { describe, expect, it } from "vitest";

import { classifyFollowUp } from "../follow-up";
import {
  DomainInvariantError,
  assertSameOrganization,
} from "../invariants";
import {
  confirmedOrderInputSchema,
  customerContactUpdateSchema,
  customerImportInputSchema,
  followUpInputSchema,
  moneySchema,
  orderItemInputSchema,
} from "../schemas";

const organizationId =
  "11111111-1111-4111-8111-111111111111";

const otherOrganizationId =
  "22222222-2222-4222-8222-222222222222";

const customerId =
  "33333333-3333-4333-8333-333333333333";

describe("customer domain", () => {
  it("accepts a customer with only the required name", () => {
    const result = customerImportInputSchema.parse({
      organizationId,
      name: "Rosa Casagrande",
    });

    expect(result.name).toBe("Rosa Casagrande");
    expect(result.document).toBeUndefined();
    expect(result.whatsapp).toBeUndefined();
  });

  it("normalizes optional document and WhatsApp", () => {
    const result = customerImportInputSchema.parse({
      organizationId,
      internalCode: " 1492 ",
      name: "ENGEPAR",
      document: "01.618.204/0001-53",
      whatsapp: "(67) 99336-0660",
    });

    expect(result.internalCode).toBe("1492");
    expect(result.document).toBe("01618204000153");
    expect(result.whatsapp).toBe("67993360660");
  });

  it("rejects invalid document length", () => {
    const result = customerImportInputSchema.safeParse({
      organizationId,
      name: "Cliente Teste",
      document: "123",
    });

    expect(result.success).toBe(false);
  });

  it("allows manual updates only for WhatsApp and observations", () => {
    const result = customerContactUpdateSchema.parse({
      whatsapp: "(67) 99999-9999",
      observations:
        "Falar com Fulano pelo contato comercial.",
    });

    expect(result.whatsapp).toBe("67999999999");
    expect(result.observations).toContain("Fulano");
  });

  it("rejects other customer fields in manual updates", () => {
    const result = customerContactUpdateSchema.safeParse({
      name: "Nome alterado indevidamente",
    });

    expect(result.success).toBe(false);
  });
});

describe("order domain", () => {
  it("accepts canonical monetary values", () => {
    expect(moneySchema.parse("212.80")).toBe("212.80");
  });

  it("rejects monetary values with more than two decimals", () => {
    expect(
      moneySchema.safeParse("212.805").success,
    ).toBe(false);
  });

  it("supports decimal quantities and open unit names", () => {
    const result = orderItemInputSchema.parse({
      name: "Produto de teste",
      quantity: "1.5",
      unit: "PACOTE",
    });

    expect(result.quantity).toBe("1.5");
    expect(result.unit).toBe("PACOTE");
  });

  it("defaults absent discount and freight to zero", () => {
    const result = confirmedOrderInputSchema.parse({
      organizationId,
      customerId,
      number: "80884",
      customerName: "ENGEPAR",
      productsTotal: "212.80",
      grandTotal: "212.80",
      items: [
        {
          name: "ALCOOL 70 1 LITRO",
          quantity: "1",
          unit: "UN",
        },
      ],
    });

    expect(result.discountTotal).toBe("0");
    expect(result.freightTotal).toBe("0");
  });

  it("accepts the consolidated totals required by the CRM", () => {
    const result = confirmedOrderInputSchema.parse({
      organizationId,
      customerId,
      number: "75081",
      customerName: "Rosa Casagrande",
      productsTotal: "680.90",
      discountTotal: "37.80",
      freightTotal: "5.00",
      grandTotal: "648.10",
      items: [
        {
          name: "LENCOL PAPEL 70CMX50M AMARELO PLUMAX",
          quantity: "20",
          unit: "UN",
        },
      ],
    });

    expect(result.productsTotal).toBe("680.90");
    expect(result.discountTotal).toBe("37.80");
    expect(result.freightTotal).toBe("5.00");
    expect(result.grandTotal).toBe("648.10");
  });

  it("requires at least one order item", () => {
    const result = confirmedOrderInputSchema.safeParse({
      organizationId,
      customerId,
      number: "SEM-ITEM",
      customerName: "Cliente Teste",
      productsTotal: "0",
      grandTotal: "0",
      items: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("follow-up domain", () => {
  it("requires completedAt when completed", () => {
    const result = followUpInputSchema.safeParse({
      organizationId,
      customerId,
      title: "Retornar contato",
      dueAt: "2026-09-23T15:00:00Z",
      status: "COMPLETED",
    });

    expect(result.success).toBe(false);
  });

  it("classifies overdue, today, upcoming and completed", () => {
    const now = new Date("2026-09-23T12:00:00Z");

    expect(
      classifyFollowUp(
        "PENDING",
        new Date("2026-09-22T12:00:00Z"),
        now,
        "UTC",
      ),
    ).toBe("OVERDUE");

    expect(
      classifyFollowUp(
        "PENDING",
        new Date("2026-09-23T23:00:00Z"),
        now,
        "UTC",
      ),
    ).toBe("TODAY");

    expect(
      classifyFollowUp(
        "PENDING",
        new Date("2026-09-24T12:00:00Z"),
        now,
        "UTC",
      ),
    ).toBe("UPCOMING");

    expect(
      classifyFollowUp(
        "COMPLETED",
        new Date("2026-09-20T12:00:00Z"),
        now,
        "UTC",
      ),
    ).toBe("COMPLETED");
  });
});

describe("tenant invariants", () => {
  it("accepts relations inside the same organization", () => {
    expect(() =>
      assertSameOrganization(
        organizationId,
        organizationId,
        "Cliente",
      ),
    ).not.toThrow();
  });

  it("rejects cross-organization relations", () => {
    expect(() =>
      assertSameOrganization(
        organizationId,
        otherOrganizationId,
        "Cliente",
      ),
    ).toThrow(DomainInvariantError);
  });
});
