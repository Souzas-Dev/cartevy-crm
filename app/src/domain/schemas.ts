import { z } from "zod";

import {
  normalizeDocument,
  normalizeEmail,
  normalizeInternalCode,
  normalizePhone,
} from "./normalization";

const optionalTrimmedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

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

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine(
    (value) => value.length >= 10 && value.length <= 15,
    "Telefone deve conter entre 10 e 15 dígitos.",
  );

export const moneySchema = z
  .string()
  .trim()
  .regex(
    /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/,
    "Valor monetário inválido.",
  );

export const customerInputSchema = z.object({
  organizationId: z.string().uuid(),
  responsibleUserId: z.string().uuid().optional(),
  internalCode: z
    .string()
    .transform(normalizeInternalCode)
    .pipe(z.string().min(1).max(80))
    .optional(),
  name: z.string().trim().min(2).max(200),
  document: documentSchema.optional(),
  phone: phoneSchema.optional(),
  notes: optionalTrimmedText(5000),
});

export const orderOriginSchema = z.enum([
  "MANUAL",
  "PDF_IMPORT",
  "TELEGRAM",
  "LOCAL_MONITOR",
  "INTEGRATION",
]);

export const orderInputSchema = z.object({
  organizationId: z.string().uuid(),
  customerId: z.string().uuid(),
  responsibleUserId: z.string().uuid().optional(),
  number: z.string().trim().min(1).max(100),
  orderedAt: z.coerce.date(),
  total: moneySchema,
  origin: orderOriginSchema.default("MANUAL"),
  notes: optionalTrimmedText(5000),
});

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
