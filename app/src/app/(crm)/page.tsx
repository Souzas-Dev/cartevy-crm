export default function DashboardPage() {
  const indicators = [
    { label: "Pedidos", value: "—" },
    { label: "Clientes", value: "—" },
    { label: "Follow-ups", value: "—" },
    { label: "Encomendas", value: "—" },
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm text-neutral-500">Visão geral</p>
        <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Acompanhamento da rotina comercial do CRM de Vendas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((indicator) => (
          <article
            key={indicator.label}
            className="rounded-lg border border-neutral-200 bg-white p-5"
          >
            <p className="text-sm text-neutral-500">{indicator.label}</p>
            <p className="mt-3 text-3xl font-semibold">{indicator.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Atividade comercial</h2>
        <p className="mt-2 text-neutral-600">
          Os indicadores serão alimentados quando a persistência e o domínio comercial forem implementados.
        </p>
      </section>
    </section>
  );
}
