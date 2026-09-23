"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

type CrmShellProps = Readonly<{
  children: ReactNode;
}>;

type Theme = "light" | "dark";

const navigationItems = [
  { label: "Dashboard", href: "/" },
  { label: "Pedidos", href: "/pedidos" },
  { label: "Clientes", href: "/clientes" },
  { label: "Follow-ups", href: "/follow-ups" },
  { label: "Encomendas", href: "/encomendas" },
  { label: "Configurações", href: "/configuracoes" },
] as const;

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  window.localStorage.setItem("crm-theme", theme);
}

export function CrmShell({ children }: CrmShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleTheme() {
    const nextTheme: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    applyTheme(nextTheme);
  }

  function handleNavigation() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      ) : null}

      <div className="group/sidebar fixed inset-y-0 left-0 z-50 w-3">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-3 md:block"
        />

        <aside
          className={`fixed inset-y-0 left-0 flex w-72 flex-col border-r border-neutral-200 bg-white p-6 shadow-xl transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:group-hover/sidebar:translate-x-0"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <strong className="font-brand text-xl font-semibold">
                CRM de Vendas
              </strong>

              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Operação comercial
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              Fechar
            </button>
          </div>

          <nav
            aria-label="Navegação principal"
            className="mt-8 flex-1"
          >
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={handleNavigation}
                      className={`block rounded-md px-3 py-2 transition-colors ${
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500">
            Passe o cursor pela borda esquerda para abrir.
          </p>
        </aside>
      </div>

      <div className="min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-6 backdrop-blur transition-colors dark:border-neutral-800 dark:bg-neutral-900/95 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-expanded={sidebarOpen}
              aria-label="Abrir ou fechar menu principal"
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Menu
            </button>

            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              Área comercial
            </span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar modo claro e escuro"
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <span className="dark:hidden">Modo escuro</span>
            <span className="hidden dark:inline">Modo claro</span>
          </button>
        </header>

        <main className="p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
