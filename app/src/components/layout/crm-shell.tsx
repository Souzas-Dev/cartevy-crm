import Link from "next/link";
import type { ReactNode } from "react";

type CrmShellProps = Readonly<{
  children: ReactNode;
}>;

const navigationItems = [
  { label: "Dashboard", href: "/" },
  { label: "Pedidos", href: "/pedidos" },
  { label: "Clientes", href: null },
  { label: "Follow-ups", href: null },
  { label: "Encomendas", href: null },
  { label: "Configurações", href: null },
] as const;

export function CrmShell({ children }: CrmShellProps) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-neutral-200 bg-white p-6">
        <div className="flex flex-col gap-1">
          <strong className="text-xl font-semibold">CRM de Vendas</strong>
          <span className="text-sm text-neutral-500">Operação comercial</span>
        </div>

        <nav aria-label="Navegação principal" className="mt-8">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
  <li key={item.label} className="rounded-md px-3 py-2">
    {item.href ? (
      <Link href={item.href} className="block">
        {item.label}
      </Link>
    ) : (
      <span>{item.label}</span>
    )}
  </li>
))}
          </ul>
        </nav>
      </aside>

      <div className="ml-64 min-h-screen">
        <header className="flex h-16 items-center border-b border-neutral-200 bg-white px-8">
          <span className="text-sm text-neutral-600">Área comercial</span>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
