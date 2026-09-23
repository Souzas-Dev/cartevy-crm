"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const sidebarOpen = sidebarPinned || sidebarHovered;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setSidebarPinned(false);
      setSidebarHovered(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    applyTheme(nextTheme);
  }

  function openSidebar() {
    setSidebarPinned(true);

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
  }

  function closeSidebar() {
    setSidebarPinned(false);
    setSidebarHovered(false);

    window.requestAnimationFrame(() => {
      menuButtonRef.current?.focus();
    });
  }

  function toggleSidebar() {
    if (sidebarPinned) {
      closeSidebar();
      return;
    }

    openSidebar();
  }

  function handleNavigation() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarPinned(false);
      setSidebarHovered(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      {sidebarPinned ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      ) : null}

      <div
        aria-hidden="true"
        onMouseEnter={() => setSidebarHovered(true)}
        className="fixed inset-y-0 left-0 z-40 hidden w-3 md:block"
      />

      <aside
        id="crm-sidebar"
        aria-hidden={!sidebarOpen}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral-200 bg-white p-6 shadow-xl transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
            ref={closeButtonRef}
            type="button"
            tabIndex={sidebarOpen ? 0 : -1}
            onClick={closeSidebar}
            className="rounded-md px-2 py-1 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:outline-neutral-100"
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
                    tabIndex={sidebarOpen ? 0 : -1}
                    aria-current={isActive ? "page" : undefined}
                    onClick={handleNavigation}
                    className={`block rounded-md px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isActive
                        ? "bg-neutral-900 text-white focus-visible:outline-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 dark:focus-visible:outline-neutral-100"
                        : "text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100"
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
          Passe o cursor pela borda esquerda ou use o botão Menu.
        </p>
      </aside>

      <div className="min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-6 backdrop-blur transition-colors dark:border-neutral-800 dark:bg-neutral-900/95 md:px-8">
          <div className="flex items-center gap-4">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={toggleSidebar}
              aria-controls="crm-sidebar"
              aria-expanded={sidebarOpen}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100"
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
            className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100"
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
