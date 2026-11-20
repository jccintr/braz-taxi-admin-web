const TONE = {
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  info: 'bg-info/12 text-info',
  primary: 'bg-primary text-primary-ink',
  neutral: 'bg-surface-alt text-text-soft',
};

export default function ToneBadge({ tone = 'neutral', dot = false, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone] ?? TONE.neutral} ${className}`}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
