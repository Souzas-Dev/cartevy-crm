"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { requireAuthContext } from "@/server/auth/context";
import {
  CustomerIdentityConflictError,
  CustomerNotFoundError,
} from "@/server/services/errors";
import {
  createCustomer,
} from "@/server/services/customer-registration-service";
import {
  updateCustomerContact,
} from "@/server/services/customer-contact-service";

export type CustomerActionState = Readonly<{
  status: "idle" | "success" | "error";
  message: string;
}>;

class InvalidCustomerFormError extends Error {}

function readTextField(
  formData: FormData,
  name: string,
  maxLength: number,
): string {
  const values = formData.getAll(name);

  if (
    values.length !== 1 ||
    typeof values[0] !== "string" ||
    values[0].length > maxLength
  ) {
    throw new InvalidCustomerFormError();
  }

  return values[0];
}

function optionalText(value: string): string | undefined {
  return value.trim() ? value : undefined;
}

function publicErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Dados do cliente inválidos.";
  }

  if (
    error instanceof CustomerIdentityConflictError ||
    error instanceof CustomerNotFoundError
  ) {
    return error.message;
  }

  if (error instanceof InvalidCustomerFormError) {
    return "Dados do formulário inválidos.";
  }

  console.error("customer_action_failed", {
    errorName:
      error instanceof Error
        ? error.name
        : "UnknownError",
  });

  return "Não foi possível salvar o cliente.";
}

export async function createCustomerAction(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const auth = await requireAuthContext();

  try {
    await createCustomer(
      prisma,
      auth.organizationId,
      auth.appUserId,
      {
        internalCode: readTextField(
          formData,
          "internalCode",
          80,
        ),
        name: readTextField(
          formData,
          "name",
          200,
        ),
        document: optionalText(
          readTextField(
            formData,
            "document",
            32,
          ),
        ),
        whatsapp: optionalText(
          readTextField(
            formData,
            "whatsapp",
            32,
          ),
        ),
        observations: optionalText(
          readTextField(
            formData,
            "observations",
            5000,
          ),
        ),
      },
    );

    revalidatePath("/clientes");

    return {
      status: "success",
      message: "Cliente cadastrado com sucesso.",
    };
  }
  catch (error) {
    return {
      status: "error",
      message: publicErrorMessage(error),
    };
  }
}

export async function updateCustomerContactAction(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const auth = await requireAuthContext();

  try {
    const customerId = z
      .string()
      .uuid()
      .parse(
        readTextField(
          formData,
          "customerId",
          64,
        ),
      );

    const whatsapp =
      readTextField(
        formData,
        "whatsapp",
        32,
      );

    await updateCustomerContact(
      prisma,
      auth.organizationId,
      customerId,
      {
        whatsapp:
          whatsapp.trim() === ""
            ? null
            : whatsapp,
        observations: readTextField(
          formData,
          "observations",
          5000,
        ),
      },
    );

    revalidatePath("/clientes");

    return {
      status: "success",
      message: "Contato atualizado com sucesso.",
    };
  }
  catch (error) {
    return {
      status: "error",
      message: publicErrorMessage(error),
    };
  }
}
