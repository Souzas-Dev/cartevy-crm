import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getAuthContext()) redirect("/");
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-6 py-12 dark:bg-neutral-950">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900" aria-labelledby="login-title">
        <p className="font-brand text-3xl font-semibold">Cartevy CRM</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">by Souzas Dev</p>
        <p className="mt-6 text-neutral-600 dark:text-neutral-300">Sua carteira comercial em movimento.</p>
        <h1 id="login-title" className="mt-8 text-2xl font-semibold">Entre na sua conta</h1>
        <LoginForm />
      </section>
    </main>
  );
}
