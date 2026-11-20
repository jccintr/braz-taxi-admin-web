import { Button, Spinner } from 'flowbite-react';

// flowbite-react 0.12 não tem mais a prop de "processando": spinner + desabilitado enquanto `loading`.
export default function LoadingButton({ loading = false, disabled = false, children, ...rest }) {
  return (
    <Button {...rest} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading && <Spinner size="sm" className="mr-2" aria-hidden="true" />}
      {children}
    </Button>
  );
}
