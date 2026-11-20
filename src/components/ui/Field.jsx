import { Label } from 'flowbite-react';

export default function Field({ id, label, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-text-soft">{hint}</p> : null}
    </div>
  );
}
