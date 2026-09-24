import type {
  PrismaClient,
} from "@/generated/prisma/client";

import {
  confirmedOrderImportSchema,
  type ConfirmedOrderImportInput,
} from "@/domain/schemas";

import {
  resolveRegisteredCustomer,
} from "../persistence/customer-repository";
import {
  findOrderByNumber,
} from "../persistence/order-repository";
import {
  DuplicateOrderError,
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

export async function persistConfirmedOrder(
  prisma: PrismaClient,
  input: ConfirmedOrderImportInput,
) {
  const data = confirmedOrderImportSchema.parse(input);

  try {
    return await prisma.$transaction(async (tx) => {
      const existingOrder =
        await findOrderByNumber(
          tx,
          data.organizationId,
          data.number,
        );

      if (existingOrder) {
        throw new DuplicateOrderError(
          data.number,
        );
      }

      let customer = null;

      // O código interno da loja é a fronteira entre:
      //
      // 1. venda sem cadastro:
      //    persiste Order + OrderItem, sem Customer;
      //
      // 2. cliente cadastrado:
      //    cria/reaproveita Customer e habilita
      //    histórico comercial/follow-up.
      //
      // Nome nunca é utilizado como identidade.
      if (data.customer.internalCode) {
        customer =
          await resolveRegisteredCustomer(
            tx,
            data.organizationId,
            {
              internalCode:
                data.customer.internalCode,
              name: data.customer.name,
              document:
                data.customer.document,
              whatsapp:
                data.customer.whatsapp,
            },
          );

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              organizationId:
                data.organizationId,
              responsibleUserId:
                data.responsibleUserId,
              internalCode:
                data.customer.internalCode,
              name:
                data.customer.name,
              document:
                data.customer.document,
              whatsapp:
                data.customer.whatsapp,
            },
          });
        }
      }

      const order = await tx.order.create({
        data: {
          organizationId:
            data.organizationId,

          customerId:
            customer?.id ?? null,

          // Snapshot do nome exatamente como
          // recebido no pedido confirmado.
          customerName:
            data.customer.name,

          responsibleUserId:
            data.responsibleUserId,

          number:
            data.number,

          importedAt:
            data.importedAt ?? new Date(),

          productsTotal:
            data.productsTotal,

          discountTotal:
            data.discountTotal,

          freightTotal:
            data.freightTotal,

          grandTotal:
            data.grandTotal,
        },
      });

      await tx.orderItem.createMany({
        data: data.items.map((item) => ({
          organizationId:
            data.organizationId,

          orderId:
            order.id,

          name:
            item.name,

          quantity:
            item.quantity,

          unit:
            item.unit,
        })),
      });

      return tx.order.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id: order.id,
            organizationId:
              data.organizationId,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });
  }
  catch (error) {
    if (error instanceof DuplicateOrderError) {
      throw error;
    }

    if (hasPrismaCode(error, "P2002")) {
      const existing =
        await findOrderByNumber(
          prisma,
          data.organizationId,
          data.number,
        );

      if (existing) {
        throw new DuplicateOrderError(
          data.number,
        );
      }
    }

    throw error;
  }
}
