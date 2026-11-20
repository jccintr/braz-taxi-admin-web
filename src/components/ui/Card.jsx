export default function Card({ title, actions, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`rounded-xl border border-border bg-surface ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-text-soft">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
