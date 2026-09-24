import { z } from "zod";

import {
  normalizeDocument,
  normalizeEmail,
  normalizeInternalCode,
  normalizeWhatsapp,
} from "./normalization";

const optionalTrimmedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const editableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()
    .optional();

export const organizationInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const appUserInputSchema = z.object({
  organizationId: z.string().uuid(),
  authUserId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  email: z
    .string()
    .trim()
    .email()
    .transform(normalizeEmail),
});

export const documentSchema = z
  .string()
  .trim()
  .transform(normalizeDocument)
  .refine(
    (value) => value.length === 11 || value.length === 14,
    "Documento deve conter 11 dígitos para CPF ou 14 para CNPJ.",
  );

export const whatsappSchema = z
  .string()
  .trim()
  .transform(normalizeWhatsapp)
  .refine(
    (value) => value.length >= 10 && value.length <= 15,
    "WhatsApp deve conter entre 10 e 15 dígitos.",
  );

export const moneySchema = z
  .string()
  .trim()
  .regex(
    /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/,
    "Valor monetário inválido.",
  );

export const quantitySchema = z
  .string()
  .trim()
  .regex(
    /^(0|[1-9]\d{0,9})(\.\d{1,4})?$/,
    "Quantidade inválida.",
  )
  .refine(
    (value) => Number(value) > 0,
    "Quantidade deve ser maior que zero.",
  );

export const importedCustomerSchema = z
  .object({
    internalCode: z
      .string()
      .transform(normalizeInternalCode)
      .pipe(z.string().min(1).max(80))
      .optional(),
    name: z.string().trim().min(1).max(200),
    document: documentSchema.optional(),
    whatsapp: whatsappSchema.optional(),
  })
  .strict();

export const customerImportInputSchema =
  importedCustomerSchema.extend({
    organizationId: z.string().uuid(),
    responsibleUserId: z.string().uuid().optional(),
  });

export const customerContactUpdateSchema = z
  .object({
    whatsapp: whatsappSchema.nullable().optional(),
    observations: editableText(5000),
  })
  .strict()
  .refine(
    (value) =>
      value.whatsapp !== undefined ||
      value.observations !== undefined,
    "Informe ao menos um campo para atualização.",
  );

export const orderItemInputSchema = z
  .object({
    name: z.string().trim().min(1).max(500),
    quantity: quantitySchema,
    unit: z.string().trim().min(1).max(40),
  })
  .strict();

export const confirmedOrderInputSchema = z
  .object({
    organizationId: z.string().uuid(),
    customerId: z.string().uuid().nullable().optional(),
    customerName: z.string().trim().min(1).max(200),
    responsibleUserId: z.string().uuid().optional(),
    number: z.string().trim().min(1).max(100),
    importedAt: z.coerce.date().optional(),
    productsTotal: moneySchema,
    discountTotal: moneySchema.default("0"),
    freightTotal: moneySchema.default("0"),
    grandTotal: moneySchema,
    items: z.array(orderItemInputSchema).min(1),
  })
  .strict();

export const confirmedOrderImportSchema = z
  .object({
    organizationId: z.string().uuid(),
    responsibleUserId: z.string().uuid().optional(),
    customer: importedCustomerSchema,
    number: z.string().trim().min(1).max(100),
    importedAt: z.coerce.date().optional(),
    productsTotal: moneySchema,
    discountTotal: moneySchema.default("0"),
    freightTotal: moneySchema.default("0"),
    grandTotal: moneySchema,
    items: z.array(orderItemInputSchema).min(1),
  })
  .strict();

export type ConfirmedOrderImportInput =
  z.input<typeof confirmedOrderImportSchema>;

export type CustomerContactUpdateInput =
  z.input<typeof customerContactUpdateSchema>;

export const followUpStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
]);

export const followUpInputSchema = z
  .object({
    organizationId: z.string().uuid(),
    customerId: z.string().uuid(),
    orderId: z.string().uuid().optional(),
    responsibleUserId: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(200),
    notes: optionalTrimmedText(5000),
    dueAt: z.coerce.date(),
    status: followUpStatusSchema.default("PENDING"),
    completedAt: z.coerce.date().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.status === "COMPLETED" &&
      !value.completedAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["completedAt"],
        message:
          "Follow-up concluído deve possuir data de conclusão.",
      });
    }

    if (
      value.status === "PENDING" &&
      value.completedAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["completedAt"],
        message:
          "Follow-up pendente não pode possuir data de conclusão.",
      });
    }
  });

export const backorderStatusSchema = z.enum([
  "WAITING_PRODUCT",
  "PRODUCT_AVAILABLE",
  "CUSTOMER_NOTIFIED",
  "COMPLETED",
]);

export const backorderInputSchema = z.object({
  organizationId: z.string().uuid(),
  orderId: z.string().uuid(),
  responsibleUserId: z.string().uuid().optional(),
  description: z.string().trim().min(1).max(500),
  estimatedAt: z.coerce.date().optional(),
  notes: optionalTrimmedText(5000),
  status: backorderStatusSchema.default("WAITING_PRODUCT"),
});
