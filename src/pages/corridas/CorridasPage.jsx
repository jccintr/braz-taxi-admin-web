import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineTruck } from 'react-icons/hi';
import { listRides } from '../../api/adminApi';
import { useResource } from '../../hooks/useResource';
import { useLive } from '../../context/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import Avatar from '../../components/ui/Avatar';
import RideStatusBadge from '../../components/ui/RideStatusBadge';
import { ErrorState, Loading, Empty } from '../../components/ui/States';
import { RIDE_TABS } from '../../lib/rides';
import { formatDateTime, formatMoney, timeAgo } from '../../lib/format';

// status "implícito" de cada lista (algumas rotas da API não devolvem o campo status)
const TAB_STATUS = { pendentes: 0, aceitas: 1, 'em-andamento': 4, concluidas: 5, 'canceladas-motorista': -2, 'canceladas-passageiro': -1 };
const LIVE_TABS = new Set(['pendentes', 'aceitas', 'em-andamento']);

function Person({ p, fallback }) {
  if (!p) return <span className="text-text-soft">{fallback}</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar src={p.avatar} name={p.name} size="size-7" />
      <span className="truncate">{p.name}</span>
    </span>
  );
}

export default function CorridasPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = RIDE_TABS.some((t) => t.key === params.get('lista')) ? params.get('lista') : 'concluidas';
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const { updatedAt, counts } = useLive();

  const { data, error, loading, reload } = useResource((signal) => listRides(tab, page, signal), [tab, page]);

  // listas "ao vivo" acompanham o pulso da operação (a cada 20 s)
  useEffect(() => {
    if (LIVE_TABS.has(tab) && updatedAt) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt]);

  const go = (changes) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    Object.entries(changes).forEach(([k, v]) => (v === undefined || v === 1 && k === 'pagina' ? next.delete(k) : next.set(k, v)));
    return next;
  }, { replace: true });

  const rides = data?.data ?? [];
  const current = RIDE_TABS.find((t) => t.key === tab);
  const liveCount = { pendentes: counts.pending, aceitas: counts.accepted };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Corridas" subtitle={current.hint} />

      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div role="tablist" aria-label="Situação" className="flex w-max gap-1 rounded-xl bg-surface-alt p-1">
          {RIDE_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => go({ lista: t.key, pagina: undefined })}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-ink shadow-sm' : 'text-text-soft hover:bg-surface hover:text-text'}`}
            >
              {t.label}
              {liveCount[t.key] > 0 && <span className={`rounded-full px-1.5 text-xs font-bold tabular-nums ${tab === t.key ? 'bg-primary-ink text-primary' : 'bg-primary text-primary-ink'}`}>{liveCount[t.key]}</span>}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}

      {loading && !data ? <Loading /> : (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={loading}>
          {rides.length === 0 && !error ? (
            <Empty icon={HiOutlineTruck}>Nenhuma corrida nesta lista.</Empty>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-alt text-xs uppercase tracking-wide text-text-soft">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Quando</th>
                      <th className="px-4 py-3 font-semibold">Passageiro</th>
                      <th className="px-4 py-3 font-semibold">Motorista</th>
                      <th className="px-4 py-3 font-semibold">Situação</th>
                      <th className="px-4 py-3 text-right font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rides.map((r) => (
                      <tr key={r._id} onClick={() => navigate(`/corridas/${r._id}`)} className="cursor-pointer text-text transition-colors hover:bg-surface-alt">
                        <td className="whitespace-nowrap px-4 py-3">
                          <Link to={`/corridas/${r._id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-accent">{formatDateTime(r.data)}</Link>
                          <span className="block text-xs text-text-soft">{timeAgo(r.data)}</span>
                        </td>
                        <td className="max-w-56 px-4 py-3"><Person p={r.passenger} fallback="—" /></td>
                        <td className="max-w-56 px-4 py-3"><Person p={r.driver} fallback={tab === 'pendentes' ? 'aguardando…' : '—'} /></td>
                        <td className="px-4 py-3"><RideStatusBadge status={r.status ?? TAB_STATUS[tab]} /></td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(r.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {rides.map((r) => (
                  <li key={r._id}>
                    <Link to={`/corridas/${r._id}`} className="block rounded-xl border border-border bg-surface p-4 hover:bg-surface-alt">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-text">{formatDateTime(r.data)}</span>
                        <span className="font-semibold tabular-nums text-text">{formatMoney(r.valor)}</span>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-text">
                        <Person p={r.passenger} fallback="—" />
                        {r.driver && <Person p={r.driver} fallback="" />}
                      </div>
                      <div className="mt-3"><RideStatusBadge status={r.status ?? TAB_STATUS[tab]} /></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {data && <Pagination page={page} pages={data.pages} onChange={(p) => go({ pagina: p })} disabled={loading} />}
        </div>
      )}
    </div>
  );
}
