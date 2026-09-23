import { describe, expect, it } from "vitest";

import { classifyFollowUp } from "../follow-up";
import {
  DomainInvariantError,
  assertSameOrganization,
} from "../invariants";
import {
  customerInputSchema,
  followUpInputSchema,
  moneySchema,
  orderInputSchema,
} from "../schemas";

const organizationId =
  "11111111-1111-4111-8111-111111111111";

const otherOrganizationId =
  "22222222-2222-4222-8222-222222222222";

const customerId =
  "33333333-3333-4333-8333-333333333333";

describe("customer domain", () => {
  it("normalizes CPF and phone before persistence", () => {
    const result = customerInputSchema.parse({
      organizationId,
      name: "Cliente Teste",
      document: "123.456.789-01",
      phone: "(67) 99999-9999",
    });

    expect(result.document).toBe("12345678901");
    expect(result.phone).toBe("67999999999");
  });

  it("rejects invalid document length", () => {
    const result = customerInputSchema.safeParse({
      organizationId,
      name: "Cliente Teste",
      document: "123",
    });

    expect(result.success).toBe(false);
  });
});

describe("order domain", () => {
  it("accepts canonical monetary values", () => {
    expect(moneySchema.parse("1500.25")).toBe("1500.25");
  });

  it("rejects monetary values with more than two decimals", () => {
    expect(
      moneySchema.safeParse("1500.259").success,
    ).toBe(false);
  });

  it("defaults order origin to MANUAL", () => {
    const result = orderInputSchema.parse({
      organizationId,
      customerId,
      number: "PED-001",
      orderedAt: "2026-09-23",
      total: "1500.25",
    });

    expect(result.origin).toBe("MANUAL");
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
