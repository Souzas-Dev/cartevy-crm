"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

const inputClass = "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-neutral-900 outline-offset-4 focus-visible:outline-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { message: "" });
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="username" className="text-sm font-medium">Usuário</label>
        <input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false}
          required maxLength={256} className={inputClass} aria-describedby={state.message ? "login-error" : undefined} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256}
          className={inputClass} aria-describedby={state.message ? "login-error" : undefined} />
      </div>
      <p id="login-error" role="alert" aria-live="polite" className="min-h-5 text-sm text-red-700 dark:text-red-300">{state.message}</p>
      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
