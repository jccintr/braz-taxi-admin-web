import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';
import { HiOutlineClipboardList, HiOutlineRefresh, HiOutlineTrash } from 'react-icons/hi';
import { deleteLog, listLogs } from '../api/adminApi';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Avatar from '../components/ui/Avatar';
import ToneBadge from '../components/ui/ToneBadge';
import { ErrorState, Loading, Empty } from '../components/ui/States';
import { formatDate, formatTimeSec } from '../lib/format';

/** As duas fontes de log da API (cada uma paginada, 10 por página, do mais recente ao mais antigo). */
const SOURCES = {
  drivers: { key: 'drivers', label: 'Motorista', field: 'driver', base: '/motoristas', tone: 'info' },
  passengers: { key: 'passengers', label: 'Passageiro', field: 'passenger', base: '/passageiros', tone: 'warning' },
};

const FILTERS = [
  { key: 'todos', label: 'Todos', sources: ['drivers', 'passengers'] },
  { key: 'drivers', label: 'Motoristas', sources: ['drivers'] },
  { key: 'passengers', label: 'Passageiros', sources: ['passengers'] },
];

const STEP = 10; // quantos registros a mais cada "Carregar mais" mostra

const ts = (log) => new Date(log?.data).getTime() || 0;
const hasMore = (s) => s.page < s.pages;

/**
 * Funde as fontes numa linha do tempo só, ordenada por data.
 * Como cada fonte vem paginada, só dá para mostrar com segurança os registros mais novos que o
 * último registro carregado de cada fonte que ainda tem páginas — abaixo disso pode faltar algo
 * da outra fonte. `cutoff` é esse limite.
 */
function mergeStreams(streams) {
  const list = Object.values(streams);
  const all = list
    .flatMap((s) => s.items.map((log) => ({ log, src: s.key })))
    .sort((a, b) => ts(b.log) - ts(a.log));
  const limits = list.filter(hasMore).map((s) => ts(s.items.at(-1)));
  const cutoff = limits.length ? Math.max(...limits) : -Infinity;
  return { safe: all.filter((e) => ts(e.log) >= cutoff), more: list.some(hasMore) };
}

const addPage = (stream, res) => {
  const seen = new Set(stream.items.map((l) => l._id));
  return {
    ...stream,
    page: Math.max(stream.page, Number(res.page) || stream.page + 1),
    pages: res.pages ?? stream.pages,
    total: res.total ?? stream.total,
    items: [...stream.items, ...(res.data ?? []).filter((l) => !seen.has(l._id))],
  };
};

/** Busca páginas da fonte que está "segurando" a timeline até haver `target` registros seguros. */
async function fill(streams, target, signal) {
  let next = streams;
  for (;;) {
    const { safe } = mergeStreams(next);
    const pending = Object.values(next).filter(hasMore);
    if (safe.length >= target || pending.length === 0) return next;
    const limiting = pending.reduce((a, b) => (ts(b.items.at(-1)) > ts(a.items.at(-1)) ? b : a));
    const res = await listLogs(limiting.key, limiting.page + 1, signal);
    next = { ...next, [limiting.key]: addPage(limiting, res) };
  }
}

async function loadFirst(keys, signal) {
  const pages = await Promise.all(keys.map((k) => listLogs(k, 1, signal)));
  const streams = {};
  keys.forEach((k, i) => { streams[k] = addPage({ key: k, page: 0, pages: 1, total: 0, items: [] }, { page: 1, ...pages[i] }); });
  return fill(streams, STEP, signal);
}

/** Atividade registrada pela API (logins, mudanças de status, etc.) de motoristas e passageiros numa timeline única. */
export default function LogsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.find((f) => f.key === params.get('de')) ?? FILTERS[0];

  const [streams, setStreams] = useState(null);
  const [visible, setVisible] = useState(STEP);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [tick, setTick] = useState(0);
  const abortRef = useRef(null);
  const streamsRef = useRef(null);
  useEffect(() => { streamsRef.current = streams; }, [streams]);

  const sourcesKey = filter.sources.join(',');
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setError('');
    setVisible(STEP);
    loadFirst(sourcesKey.split(','), controller.signal)
      .then((s) => { setStreams(s); setLoading(false); })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(errorMessage(err));
        setLoading(false);
      });
    return () => controller.abort();
  }, [sourcesKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const loadMore = async () => {
    const target = visible + STEP;
    setLoadingMore(true);
    try {
      const signal = abortRef.current?.signal;
      const s = await fill(streamsRef.current, target, signal);
      setStreams(s);
      setVisible(target);
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const remove = async (log, src) => {
    setRemoving(log._id);
    try {
      await deleteLog(src, log._id);
      const stream = streamsRef.current[src];
      let updated = { ...stream, total: stream.total - 1, items: stream.items.filter((x) => x._id !== log._id) };
      // a exclusão desloca a paginação da API em 1: rebusca a última página carregada
      // para não pular o registro que "subiu" para ela.
      if (hasMore(stream)) {
        const res = await listLogs(src, stream.page, abortRef.current?.signal);
        updated = addPage(updated, { ...res, page: stream.page });
      }
      setStreams((cur) => ({ ...cur, [src]: updated }));
    } catch (err) {
      if (err?.name !== 'AbortError') toast.error(errorMessage(err));
    } finally {
      setRemoving(null);
    }
  };

  const { safe, more } = streams ? mergeStreams(streams) : { safe: [], more: false };
  const shown = safe.slice(0, visible);
  const canLoadMore = safe.length > visible || more;
  const total = streams ? Object.values(streams).reduce((n, s) => n + (s.total || 0), 0) : 0;

  const groups = [];
  for (const entry of shown) {
    const day = formatDate(entry.log.data);
    if (groups.at(-1)?.day !== day) groups.push({ day, items: [] });
    groups.at(-1).items.push(entry);
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Logs" subtitle="Linha do tempo única do que motoristas e passageiros fizeram nos apps, do mais recente para o mais antigo." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-max gap-1 rounded-lg bg-surface-alt p-1">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter.key === f.key}
              onClick={() => setParams((prev) => { const n = new URLSearchParams(prev); n.delete('pagina'); if (f.key === 'todos') n.delete('de'); else n.set('de', f.key); return n; }, { replace: true })}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${filter.key === f.key ? 'bg-primary text-primary-ink' : 'text-text hover:bg-surface'}`}>{f.label}</button>
          ))}
        </div>
        <Button color="light" size="xs" onClick={reload} disabled={loading}>
          <HiOutlineRefresh className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar
        </Button>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !streams ? <Loading /> : groups.length === 0 ? (
        !error && <Empty icon={HiOutlineClipboardList}>Nenhum registro.</Empty>
      ) : (
        <div className={`space-y-6 ${loading ? 'opacity-60' : ''}`}>
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-soft">{g.day}</h2>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {g.items.map(({ log, src }) => {
                  const source = SOURCES[src];
                  const person = log[source.field];
                  return (
                    <li key={`${src}-${log._id}`} className="group flex items-start gap-3 px-4 py-3">
                      <span className="w-16 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-text-soft">{formatTimeSec(log.data)}</span>
                      <Avatar src={person?.avatar} name={person?.name} size="size-7" />
                      <div className="min-w-0 flex-1 text-sm">
                        <ToneBadge tone={source.tone} className="mr-2 align-middle">{source.label}</ToneBadge>
                        {person ? <Link to={`${source.base}/${person._id}`} className="font-semibold text-text hover:text-accent">{person.name}</Link> : <span className="font-semibold text-text-soft">removido</span>}
                        <span className="text-text"> {log.action}</span>
                        {log.info && <p className="text-xs text-text-soft">{log.info}</p>}
                      </div>
                      <button type="button" onClick={() => remove(log, src)} disabled={removing === log._id}
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

      {streams && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-text-soft">
          <span>Mostrando {shown.length} de {total} registros</span>
          {canLoadMore && (
            <Button color="light" size="xs" onClick={loadMore} disabled={loadingMore || loading}>
              {loadingMore && <Spinner size="xs" className="mr-1.5" />}Carregar mais
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
