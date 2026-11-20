import { formatMoney, formatMonth, timeAgo } from '../lib/format';

/** Números do histórico + mini gráfico dos últimos 6 meses (calculados no navegador). */
export default function StatsStrip({ stats, moneyLabel = 'Faturado' }) {
  const max = Math.max(1, ...stats.months.map((m) => m.count));
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 md:grid-cols-5">
      <div className="grid grid-cols-2 gap-4 md:col-span-3 md:grid-cols-4">
        {[
          ['Corridas', stats.count, `${stats.done} concluídas`],
          [moneyLabel, formatMoney(stats.total), `ticket ${formatMoney(stats.ticket)}`],
          ['Cancelamento', `${Math.round(stats.cancelRate * 100)}%`, `${stats.cancelled} canceladas`],
          ['Última', stats.last ? timeAgo(stats.last) : '—', 'corrida'],
        ].map(([k, v, h]) => (
          <div key={k}>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-soft">{k}</div>
            <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-text">{v}</div>
            <div className="text-xs text-text-soft">{h}</div>
          </div>
        ))}
      </div>
      <div className="md:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-text-soft">Concluídas por mês</div>
        <div className="mt-2 flex h-20 items-end gap-2" role="img" aria-label="Corridas concluídas nos últimos 6 meses">
          {stats.months.map((m, i) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1" title={`${m.count} corridas · ${formatMoney(m.value)}`}>
              <span className="text-[10px] tabular-nums text-text-soft">{m.count || ''}</span>
              <div className={`w-full rounded-t ${i === stats.months.length - 1 ? 'bg-primary-500' : 'bg-primary-500/40'}`} style={{ height: `${Math.max(4, (m.count / max) * 56)}px` }} />
              <span className="text-[10px] uppercase text-text-soft">{formatMonth(m.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
