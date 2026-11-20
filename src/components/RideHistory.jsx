import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import RideStatusBadge from './ui/RideStatusBadge';
import Pagination from './ui/Pagination';
import { formatDateTime, formatMoney } from '../lib/format';

const PAGE = 10;
const FILTERS = [
  { key: 'all', label: 'Todas', test: () => true },
  { key: 'done', label: 'Concluídas', test: (r) => r.status === 5 },
  { key: 'cancelled', label: 'Canceladas', test: (r) => r.status < 0 },
];

/** Histórico de corridas de um motorista ou passageiro (a API devolve tudo de uma vez). */
export default function RideHistory({ rides, counterpart }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const list = useMemo(() => rides.filter(FILTERS.find((f) => f.key === filter).test), [rides, filter]);
  const pages = Math.ceil(list.length / PAGE);
  const slice = list.slice((page - 1) * PAGE, page * PAGE);

  return (
    <Card
      title="Histórico de corridas"
      bodyClassName="p-0"
      actions={
        <div className="flex gap-1 rounded-lg bg-surface-alt p-0.5">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => { setFilter(f.key); setPage(1); }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${filter === f.key ? 'bg-surface text-text shadow-sm' : 'text-text-soft hover:text-text'}`}>
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {slice.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-text-soft">Nenhuma corrida.</p>
      ) : (
        <ul className="divide-y divide-border">
          {slice.map((r) => {
            const other = r[counterpart];
            return (
              <li key={r._id}>
                <Link to={`/corridas/${r._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-alt">
                  <Avatar src={other?.avatar} name={other?.name ?? '?'} size="size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{r.destino?.address ?? 'Destino não informado'}</p>
                    <p className="truncate text-xs text-text-soft">{formatDateTime(r.data)} · {other?.name ?? (counterpart === 'driver' ? 'sem motorista' : '—')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums text-text">{formatMoney(r.valor)}</span>
                    <RideStatusBadge status={r.status} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="px-5 pb-4">
        <Pagination page={page} pages={pages} onChange={setPage} total={list.length} noun={list.length === 1 ? 'corrida' : 'corridas'} />
      </div>
    </Card>
  );
}
