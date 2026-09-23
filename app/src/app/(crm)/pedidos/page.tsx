export default function PedidosPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Operação comercial</p>
        <h1 className="mt-1 text-3xl font-semibold">Pedidos</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Área de acompanhamento dos pedidos comerciais.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-600 dark:text-neutral-300">
          A listagem, os filtros e o cadastro de pedidos serão implementados na fase correspondente ao núcleo comercial.
        </p>
      </div>
    </section>
  );
}
