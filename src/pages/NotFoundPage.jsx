import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 h-4 w-40 bg-checker" aria-hidden="true" />
      <p className="font-display text-7xl font-semibold text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold uppercase text-text">Rota não encontrada</h1>
      <p className="mt-2 text-sm text-text-soft">Esse endereço não existe no painel.</p>
      <Button as={Link} to="/dashboard" className="mt-6">Voltar ao painel</Button>
    </div>
  );
}
