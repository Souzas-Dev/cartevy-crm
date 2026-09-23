import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";

type ModulePlaceholderProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  message: string;
}>;

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  message,
}: ModulePlaceholderProps) {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <Surface className="p-6">
        <p className="text-neutral-600 dark:text-neutral-300">
          {message}
        </p>
      </Surface>
    </section>
  );
}
