"use client";

import { useActionState } from "react";

import {
  createCustomerAction,
  type CustomerActionState,
} from "./actions";

const inputClass =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-offset-4 focus-visible:outline-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

const initialState: CustomerActionState = {
  status: "idle",
  message: "",
};

export function CustomerCreateForm() {
  const [state, action, pending] = useActionState(
    createCustomerAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="grid gap-4 lg:grid-cols-2"
    >
      <div>
        <label
          htmlFor="customer-internal-code"
          className="text-sm font-medium"
        >
          Código interno
        </label>

        <input
          id="customer-internal-code"
          name="internalCode"
          required
          maxLength={80}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="customer-name"
          className="text-sm font-medium"
        >
          Nome
        </label>

        <input
          id="customer-name"
          name="name"
          required
          maxLength={200}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="customer-document"
          className="text-sm font-medium"
        >
          CPF/CNPJ
        </label>

        <input
          id="customer-document"
          name="document"
          inputMode="numeric"
          maxLength={32}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="customer-whatsapp"
          className="text-sm font-medium"
        >
          WhatsApp
        </label>

        <input
          id="customer-whatsapp"
          name="whatsapp"
          inputMode="tel"
          maxLength={32}
          className={inputClass}
        />
      </div>

      <div className="lg:col-span-2">
        <label
          htmlFor="customer-observations"
          className="text-sm font-medium"
        >
          Observações
        </label>

        <textarea
          id="customer-observations"
          name="observations"
          rows={3}
          maxLength={5000}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
        >
          {pending
            ? "Salvando…"
            : "Cadastrar cliente"}
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
