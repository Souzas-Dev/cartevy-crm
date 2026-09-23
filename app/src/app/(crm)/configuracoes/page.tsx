export default function ConfiguracoesPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Aplicação</p>
        <h1 className="mt-1 text-3xl font-semibold">Configurações</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Área reservada às configurações da aplicação.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-600 dark:text-neutral-300">
          As opções serão adicionadas somente conforme necessidades reais forem definidas.
        </p>
      </div>
    </section>
  );
}
