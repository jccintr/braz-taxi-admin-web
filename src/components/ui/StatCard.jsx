export default function StatCard({ label, value, hint, icon: Icon, highlight = false, pulse = false, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-colors ${
        highlight ? 'border-transparent bg-primary text-primary-ink' : 'border-border bg-surface text-text'
      } ${onClick ? 'hover:border-primary-400 focus-visible:border-primary-400' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'opacity-75' : 'text-text-soft'}`}>{label}</span>
        {Icon && (
          <span className="relative">
            {pulse && <span className="absolute inset-0 animate-ping-slow rounded-full bg-warning/40" aria-hidden="true" />}
            <Icon className={`relative h-5 w-5 ${highlight ? '' : 'text-accent'}`} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <div className={`mt-1 text-xs ${highlight ? 'opacity-75' : 'text-text-soft'}`}>{hint}</div>}
    </Tag>
  );
}
