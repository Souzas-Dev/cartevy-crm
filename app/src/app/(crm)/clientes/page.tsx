export default function ClientesPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Operação comercial</p>
        <h1 className="mt-1 text-3xl font-semibold">Clientes</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Área de consulta e acompanhamento da base de clientes.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-600 dark:text-neutral-300">
          Cadastro, histórico e dados comerciais serão adicionados nas fases de domínio e núcleo comercial.
        </p>
      </div>
    </section>
  );
}
