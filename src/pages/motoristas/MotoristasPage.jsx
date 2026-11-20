import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineIdentification } from 'react-icons/hi';
import { HiOutlineBellSlash } from 'react-icons/hi2';
import { listDrivers } from '../../api/adminApi';
import { useResource } from '../../hooks/useResource';
import { useLive } from '../../context/LiveContext';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Stars from '../../components/ui/Stars';
import { ErrorState, Loading, Empty } from '../../components/ui/States';
import { normalize } from '../../lib/format';

const FILTERS = [
  { key: 'todos', label: 'Todos', test: () => true },
  { key: 'online', label: 'Online', test: (d) => d.online },
  { key: 'offline', label: 'Offline', test: (d) => !d.online },
  { key: 'sem-push', label: 'Sem notificação', test: (d) => !d.pushToken },
];
const SORTS = {
  nome: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  nota: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
};

export default function MotoristasPage() {
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.some((f) => f.key === params.get('filtro')) ? params.get('filtro') : 'todos';
  const sort = SORTS[params.get('ordem')] ? params.get('ordem') : 'nome';
  const [q, setQ] = useState('');
  const { updatedAt } = useLive();
  // a lista acompanha o pulso da operação para o online/offline ficar certo
  const { data, error, loading, reload } = useResource((signal) => listDrivers(signal), [updatedAt]);

  const set = (k, v) => setParams((p) => { const n = new URLSearchParams(p); n.set(k, v); return n; }, { replace: true });

  const drivers = useMemo(() => {
    const nq = normalize(q.trim());
    return (data ?? [])
      .filter(FILTERS.find((f) => f.key === filter).test)
      .filter((d) => !nq || normalize(d.name).includes(nq))
      .sort(SORTS[sort]);
  }, [data, filter, q, sort]);

  const countOf = (key) => (data ?? []).filter(FILTERS.find((f) => f.key === key).test).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Motoristas"
        subtitle="A frota cadastrada. Toque em um motorista para ver o histórico, editar ou enviar uma notificação."
        actions={<Button as={Link} to="/motoristas/novo"><HiOutlinePlus className="mr-1.5 h-4 w-4" />Novo motorista</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:flex-1">
          <TextInput type="search" icon={HiOutlineSearch} placeholder="Buscar pelo nome" aria-label="Buscar motoristas" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div role="group" aria-label="Filtro" className="flex flex-wrap gap-1 rounded-lg bg-surface-alt p-1">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => set('filtro', f.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filter === f.key ? 'bg-primary text-primary-ink' : 'text-text hover:bg-surface'}`}>
              {f.label} <span className="tabular-nums opacity-60">{data ? countOf(f.key) : ''}</span>
            </button>
          ))}
        </div>
        <select aria-label="Ordenar" value={sort} onChange={(e) => set('ordem', e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary-500 focus:ring-primary-500">
          <option value="nome">Ordem alfabética</option>
          <option value="nota">Melhor avaliados</option>
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : drivers.length === 0 ? (
        <Empty icon={HiOutlineIdentification}>{q || filter !== 'todos' ? 'Nenhum motorista com esses filtros.' : 'Nenhum motorista cadastrado ainda.'}</Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {drivers.map((d) => (
            <li key={d._id}>
              <Link to={`/motoristas/${d._id}`} className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary-400">
                <Avatar src={d.avatar} name={d.name} size="size-12" online={d.online} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text group-hover:text-accent">{d.name}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-text-soft">
                    <Stars value={d.rating} />
                    <span className={d.online ? 'font-semibold text-success' : ''}>{d.online ? 'online' : 'offline'}</span>
                  </div>
                </div>
                {!d.pushToken && <HiOutlineBellSlash className="h-5 w-5 text-text-soft" title="Sem notificação: o app nunca registrou o aparelho" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
