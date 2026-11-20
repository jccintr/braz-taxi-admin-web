import { Button } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

// A API devolve só o total de páginas (10 itens por página).
export default function Pagination({ page, pages, onChange, disabled = false, total, noun }) {
  if (!pages || pages <= 1) return total !== undefined ? <p className="mt-4 text-sm text-text-soft">{total} {noun}</p> : null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-text-soft">
      <span>{total !== undefined ? `${total} ${noun}` : ''}</span>
      <div className="flex items-center gap-2">
        <Button color="light" size="xs" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
          <HiChevronLeft className="h-4 w-4" />
        </Button>
        <span aria-live="polite" className="tabular-nums">Página {page} de {pages}</span>
        <Button color="light" size="xs" disabled={disabled || page >= pages} onClick={() => onChange(page + 1)} aria-label="Próxima página">
          <HiChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
