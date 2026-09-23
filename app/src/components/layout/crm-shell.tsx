import Link from "next/link";
import type { ReactNode } from "react";

type CrmShellProps = Readonly<{
  children: ReactNode;
}>;

const navigationItems = [
  { label: "Dashboard", href: "/" },
  { label: "Pedidos", href: "/pedidos" },
  { label: "Clientes", href: "/clientes" },
  { label: "Follow-ups", href: "/follow-ups" },
  { label: "Encomendas", href: "/encomendas" },
  { label: "Configurações", href: "/configuracoes" },
] as const;

export function CrmShell({ children }: CrmShellProps) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <aside className="border-b border-neutral-200 bg-white p-6 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
        <div className="flex flex-col gap-1">
          <strong className="text-xl font-semibold">CRM de Vendas</strong>
          <span className="text-sm text-neutral-500">Operação comercial</span>
        </div>

        <nav aria-label="Navegação principal" className="mt-6 md:mt-8">
          <ul className="flex gap-1 overflow-x-auto md:block md:space-y-1">
            {navigationItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-neutral-100 md:text-base"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-h-screen md:ml-64">
        <header className="flex h-16 items-center border-b border-neutral-200 bg-white px-6 md:px-8">
          <span className="text-sm text-neutral-600">Área comercial</span>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
