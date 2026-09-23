type PageHeaderProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {eyebrow}
      </p>

      <h1 className="mt-1 text-3xl font-semibold">{title}</h1>

      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
    </header>
  );
}
