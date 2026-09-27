"use client";

import { useActionState } from "react";

import {
  updateCustomerContactAction,
  type CustomerActionState,
} from "./actions";

const inputClass =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-offset-4 focus-visible:outline-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

const initialState: CustomerActionState = {
  status: "idle",
  message: "",
};

type CustomerContactFormProps = Readonly<{
  customerId: string;
  whatsapp: string | null;
  observations: string | null;
}>;

export function CustomerContactForm({
  customerId,
  whatsapp,
  observations,
}: CustomerContactFormProps) {
  const [state, action, pending] = useActionState(
    updateCustomerContactAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="mt-5 grid gap-4 md:grid-cols-2"
    >
      <input
        type="hidden"
        name="customerId"
        value={customerId}
      />

      <div>
        <label
          htmlFor={"customer-whatsapp-" + customerId}
          className="text-sm font-medium"
        >
          WhatsApp
        </label>

        <input
          id={"customer-whatsapp-" + customerId}
          name="whatsapp"
          inputMode="tel"
          maxLength={32}
          defaultValue={whatsapp ?? ""}
          className={inputClass}
        />
      </div>

      <div className="md:row-span-2">
        <label
          htmlFor={"customer-observations-" + customerId}
          className="text-sm font-medium"
        >
          Observações
        </label>

        <textarea
          id={"customer-observations-" + customerId}
          name="observations"
          rows={4}
          maxLength={5000}
          defaultValue={observations ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {pending
            ? "Atualizando…"
            : "Salvar contato"}
        </button>

        <p
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            state.status === "error"
              ? "text-sm text-red-700 dark:text-red-300"
              : "text-sm text-neutral-600 dark:text-neutral-300"
          }
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
