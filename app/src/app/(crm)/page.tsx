import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";

const indicators = [
  { label: "Pedidos", value: "—" },
  { label: "Clientes", value: "—" },
  { label: "Follow-ups", value: "—" },
  { label: "Encomendas", value: "—" },
] as const;

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Acompanhamento da rotina comercial do CRM de Vendas."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((indicator) => (
          <Surface key={indicator.label} className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {indicator.label}
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {indicator.value}
            </p>
          </Surface>
        ))}
      </div>

      <Surface className="p-6">
        <h2 className="text-xl font-semibold">
          Atividade comercial
        </h2>

        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Os indicadores serão alimentados quando a persistência e o domínio comercial forem implementados.
        </p>
      </Surface>
    </section>
  );
}
