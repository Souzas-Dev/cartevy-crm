import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  listCustomers,
  updateCustomerContactFields,
} from "@/server/persistence/customer-repository";

const organizationId =
  "11111111-1111-4111-8111-111111111111";

const customerId =
  "22222222-2222-4222-8222-222222222222";

describe("customer repository tenant scope", () => {
  it("sempre restringe a listagem pela organização", async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([]);

    const db = {
      customer: {
        findMany,
      },
    } as unknown as Parameters<
      typeof listCustomers
    >[0];

    await listCustomers(
      db,
      organizationId,
    );

    expect(
      findMany,
    ).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
      orderBy: [
        {
          name: "asc",
        },
        {
          internalCode: "asc",
        },
      ],
    });
  });

  it("usa chave composta em atualização mutável", async () => {
    const update = vi
      .fn()
      .mockResolvedValue({});

    const db = {
      customer: {
        update,
      },
    } as unknown as Parameters<
      typeof updateCustomerContactFields
    >[0];

    await updateCustomerContactFields(
      db,
      organizationId,
      customerId,
      {
        whatsapp: null,
      },
    );

    expect(
      update,
    ).toHaveBeenCalledWith({
      where: {
        id_organizationId: {
          id: customerId,
          organizationId,
        },
      },
      data: {
        whatsapp: null,
      },
    });
  });
});
