import { Alert, Button, Spinner } from 'flowbite-react';

export function Loading({ className = 'py-16' }) {
  return <div className={`flex justify-center ${className}`}><Spinner size="lg" /></div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <Alert color="failure" className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        {onRetry && <Button size="xs" color="light" onClick={onRetry}>Tentar de novo</Button>}
      </div>
    </Alert>
  );
}

export function Empty({ children, icon: Icon }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-text-soft">
      {Icon && <Icon className="h-8 w-8 opacity-60" aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}
