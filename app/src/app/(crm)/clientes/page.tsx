import { CustomerCreateForm } from "./customer-create-form";
import { CustomerContactForm } from "./customer-contact-form";

import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { prisma } from "@/lib/db/prisma";
import { requireAuthContext } from "@/server/auth/context";
import {
  listCustomers,
} from "@/server/persistence/customer-repository";

export default async function ClientesPage() {
  const auth = await requireAuthContext();

  const customers = await listCustomers(
    prisma,
    auth.organizationId,
  );

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Operação comercial"
        title="Clientes"
        description="Cadastre clientes da organização e mantenha os dados de contato usados na rotina comercial."
      />

      <Surface className="p-6">
        <h2 className="text-xl font-semibold">
          Novo cliente
        </h2>

        <p className="mt-2 mb-6 text-sm text-neutral-600 dark:text-neutral-300">
          O código interno identifica formalmente o cliente no Cartevy.
        </p>

        <CustomerCreateForm />
      </Surface>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Clientes cadastrados
            </h2>

            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              {customers.length} cliente{customers.length === 1 ? "" : "s"} nesta organização.
            </p>
          </div>
        </div>

        {customers.length === 0 ? (
          <Surface className="p-6">
            <p className="text-neutral-600 dark:text-neutral-300">
              Nenhum cliente cadastrado ainda.
            </p>
          </Surface>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <Surface
                key={customer.id}
                className="p-6"
              >
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {customer.internalCode}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      {customer.name}
                    </h3>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {customer.document
                      ? "Documento: " + customer.document
                      : "Documento não informado"}
                  </p>
                </div>

                <CustomerContactForm
                  customerId={customer.id}
                  whatsapp={customer.whatsapp}
                  observations={customer.observations}
                />
              </Surface>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
