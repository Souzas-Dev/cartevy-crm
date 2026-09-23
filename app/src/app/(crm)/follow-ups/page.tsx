export default function FollowUpsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Operação comercial</p>
        <h1 className="mt-1 text-3xl font-semibold">Follow-ups</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Organização dos próximos contatos e acompanhamentos comerciais.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-neutral-600 dark:text-neutral-300">
          Os registros e estados de follow-up serão implementados junto às regras do domínio comercial.
        </p>
      </div>
    </section>
  );
}
