import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineClipboardList, HiOutlineTrash } from 'react-icons/hi';
import { deleteLog, listLogs } from '../api/adminApi';
import { errorMessage } from '../api/client';
import { useResource } from '../hooks/useResource';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Avatar from '../components/ui/Avatar';
import Pagination from '../components/ui/Pagination';
import { ErrorState, Loading, Empty } from '../components/ui/States';
import { formatDate, formatTimeSec } from '../lib/format';

const WHO = [
  { key: 'drivers', label: 'Motoristas', field: 'driver', base: '/motoristas' },
  { key: 'passengers', label: 'Passageiros', field: 'passenger', base: '/passageiros' },
];

/** Atividade registrada pela API (logins, mudanças de status, etc.), agrupada por dia. */
export default function LogsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const who = WHO.find((w) => w.key === params.get('de')) ?? WHO[0];
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const { data, error, loading, reload, setData } = useResource((signal) => listLogs(who.key, page, signal), [who.key, page]);
  const [removing, setRemoving] = useState(null);

  const go = (changes) => setParams((prev) => {
    const n = new URLSearchParams(prev);
    Object.entries(changes).forEach(([k, v]) => (v == null ? n.delete(k) : n.set(k, v)));
    return n;
  }, { replace: true });

  const remove = async (log) => {
    setRemoving(log._id);
    try {
      await deleteLog(who.key, log._id);
      setData((d) => ({ ...d, total: d.total - 1, data: d.data.filter((x) => x._id !== log._id) }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRemoving(null);
    }
  };

  const groups = [];
  for (const log of data?.data ?? []) {
    const day = formatDate(log.data);
    if (groups.at(-1)?.day !== day) groups.push({ day, items: [] });
    groups.at(-1).items.push(log);
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Logs" subtitle="O que motoristas e passageiros fizeram nos apps, do mais recente para o mais antigo." />
      <div className="mb-5 flex w-max gap-1 rounded-lg bg-surface-alt p-1">
        {WHO.map((w) => (
          <button key={w.key} type="button" aria-pressed={who.key === w.key} onClick={() => go({ de: w.key, pagina: null })}
            className={`rounded-md px-4 py-1.5 text-sm font-medium ${who.key === w.key ? 'bg-primary text-primary-ink' : 'text-text hover:bg-surface'}`}>{w.label}</button>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : groups.length === 0 ? (
        <Empty icon={HiOutlineClipboardList}>Nenhum registro.</Empty>
      ) : (
        <div className={`space-y-6 ${loading ? 'opacity-60' : ''}`}>
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">{g.day}</h2>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {g.items.map((log) => {
                  const person = log[who.field];
                  return (
                    <li key={log._id} className="group flex items-start gap-3 px-4 py-3">
                      <span className="w-16 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-text-soft">{formatTimeSec(log.data)}</span>
                      <Avatar src={person?.avatar} name={person?.name} size="size-7" />
                      <div className="min-w-0 flex-1 text-sm">
                        {person ? <Link to={`${who.base}/${person._id}`} className="font-semibold text-text hover:text-accent">{person.name}</Link> : <span className="font-semibold text-text-soft">removido</span>}
                        <span className="text-text"> {log.action}</span>
                        {log.info && <p className="text-xs text-text-soft">{log.info}</p>}
                      </div>
                      <button type="button" onClick={() => remove(log)} disabled={removing === log._id}
                        className="rounded p-1 text-text-soft opacity-0 transition-opacity hover:bg-surface-alt hover:text-danger focus:opacity-100 group-hover:opacity-100 disabled:opacity-50" aria-label="Excluir registro">
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      {data && <Pagination page={page} pages={data.pages} total={data.total} noun="registros" onChange={(p) => go({ pagina: p })} disabled={loading} />}
    </div>
  );
}
