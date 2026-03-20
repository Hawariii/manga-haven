export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 space-y-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--gold)]">
        {eyebrow}
      </p>
      <div>
        <h2 className="text-[1.35rem] font-bold text-[var(--foreground)] lg:text-[1.55rem]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
    </div>
  );
}
