import type {
  Order,
  Prisma,
} from "@/generated/prisma/client";

type OrderDb = Pick<
  Prisma.TransactionClient,
  "order"
>;

export async function findOrderByNumber(
  db: OrderDb,
  organizationId: string,
  number: string,
): Promise<Order | null> {
  return db.order.findUnique({
    where: {
      organizationId_number: {
        organizationId,
        number,
      },
    },
  });
}
