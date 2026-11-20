import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight, HiOutlineDownload, HiOutlineStatusOnline, HiOutlineClock, HiOutlineLightningBolt, HiOutlineCheckCircle, HiOutlineUserGroup, HiOutlineIdentification, HiOutlineArrowRight } from 'react-icons/hi';
import { getDashboard, getMonthlyReport } from '../api/adminApi';
import { useResource } from '../hooks/useResource';
import { useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import { ErrorState, Loading, Empty } from '../components/ui/States';
import { formatMoney, timeAgo } from '../lib/format';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function greeting() {
  const h = Number(new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false }).format(new Date()));
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function downloadCsv(report) {
  const rows = [
    ['Período', report.periodo],
    ['Corridas finalizadas', report.corridasFinalizadas],
    ['Canceladas pelo motorista', report.canceladasMotorista],
    ['Canceladas pelo passageiro', report.canceladasPassageiro],
    ['Total faturado', String(report.totalFaturado.toFixed(2)).replace('.', ',')],
    ['Motoristas que rodaram', report.motoristasUnicos],
    [],
    ['Motorista', 'Corridas finalizadas'],
    ...report.corridasPorMotorista.map((d) => [d.nome, d.quantidade]),
  ];
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `braz-taxi-relatorio-${report.periodo.replace('/', '-')}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

function MonthlyReport() {
  const now = new Date();
  const [ref, setRef] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const { data: r, error, loading, reload } = useResource((signal) => getMonthlyReport(ref.month, ref.year, signal), [ref.month, ref.year]);
  const isCurrent = ref.month === now.getMonth() + 1 && ref.year === now.getFullYear();
  const shift = (delta) => setRef(({ month, year }) => {
    const d = new Date(year, month - 1 + delta, 1);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const total = r ? r.corridasFinalizadas + r.canceladasMotorista + r.canceladasPassageiro : 0;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const max = r?.corridasPorMotorista?.[0]?.quantidade || 1;

  return (
    <Card
      title="Relatório do mês"
      actions={
        <div className="flex items-center gap-1">
          <Button color="light" size="xs" onClick={() => shift(-1)} aria-label="Mês anterior"><HiChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-32 text-center font-display text-sm font-semibold uppercase text-text">{MONTHS[ref.month - 1]} {ref.year}</span>
          <Button color="light" size="xs" onClick={() => shift(1)} disabled={isCurrent} aria-label="Próximo mês"><HiChevronRight className="h-4 w-4" /></Button>
          <Button color="light" size="xs" className="ml-2" onClick={() => r && downloadCsv(r)} disabled={!r || loading} title="Baixar planilha (CSV)">
            <HiOutlineDownload className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !r ? <Loading className="py-10" /> : r && (
        <div className={`grid gap-6 lg:grid-cols-5 ${loading ? 'opacity-60' : ''}`}>
          <div className="space-y-5 lg:col-span-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-text-soft">Faturado</div>
              <div className="font-display text-4xl font-semibold text-text">{formatMoney(r.totalFaturado)}</div>
              <div className="text-sm text-text-soft">
                ticket médio <b className="text-text">{formatMoney(r.corridasFinalizadas ? r.totalFaturado / r.corridasFinalizadas : 0)}</b> · {r.motoristasUnicos} {r.motoristasUnicos === 1 ? 'motorista rodou' : 'motoristas rodaram'}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-text-soft">
                <span>Pedidos de corrida</span><span className="tabular-nums">{total}</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-surface-alt" role="img" aria-label="Proporção de corridas finalizadas e canceladas">
                <div className="bg-success" style={{ width: `${pct(r.corridasFinalizadas)}%` }} />
                <div className="bg-danger" style={{ width: `${pct(r.canceladasMotorista)}%` }} />
                <div className="bg-gray-400" style={{ width: `${pct(r.canceladasPassageiro)}%` }} />
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {[
                  ['bg-success', 'Finalizadas', r.corridasFinalizadas],
                  ['bg-danger', 'Canceladas pelo motorista', r.canceladasMotorista],
                  ['bg-gray-400', 'Canceladas pelo passageiro', r.canceladasPassageiro],
                ].map(([dot, label, n]) => (
                  <li key={label} className="flex items-center gap-2 text-text-soft">
                    <span className={`size-2.5 rounded-sm ${dot}`} />
                    <span className="flex-1">{label}</span>
                    <b className="tabular-nums text-text">{n}</b>
                    <span className="w-12 text-right text-xs tabular-nums">{pct(n).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-soft">Ranking de motoristas (corridas finalizadas)</div>
            {r.corridasPorMotorista.length === 0 ? (
              <Empty>Nenhuma corrida finalizada neste mês.</Empty>
            ) : (
              <ol className="space-y-2.5">
                {r.corridasPorMotorista.slice(0, 8).map((d, i) => (
                  <li key={d.nome} className="flex items-center gap-3 text-sm">
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold ${i === 0 ? 'bg-primary text-primary-ink' : 'bg-surface-alt text-text-soft'}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="truncate text-text">{d.nome}</span>
                        <b className="tabular-nums text-text">{d.quantidade}</b>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-surface-alt">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${(d.quantidade / max) * 100}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function PendingNow() {
  const { data, counts } = useLive();
  const pending = data?.pendingRides ?? [];
  const accepted = data?.acceptedRides ?? [];
  return (
    <Card title="Agora na rua" actions={<Link to="/mapa" className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline">Abrir mapa <HiOutlineArrowRight className="h-3.5 w-3.5" /></Link>} bodyClassName="p-0">
      {pending.length + accepted.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-text-soft">
          Nenhuma corrida aberta. {counts.online ? `${counts.online} ${counts.online === 1 ? 'motorista' : 'motoristas'} online esperando.` : 'Nenhum motorista online.'}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {[...pending.map((r) => ({ ...r, kind: 'pending' })), ...accepted.map((r) => ({ ...r, kind: 'accepted' }))].slice(0, 6).map((r) => (
            <li key={r._id}>
              <Link to={`/corridas/${r._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-alt">
                <Avatar src={r.passenger?.avatar} name={r.passenger?.name} size="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{r.passenger?.name ?? 'Passageiro'}</p>
                  <p className="truncate text-xs text-text-soft">{r.kind === 'pending' ? 'esperando motorista' : `com ${r.driver?.name ?? 'motorista'}`} · {timeAgo(r.data)}</p>
                </div>
                <span className={`size-2.5 rounded-full ${r.kind === 'pending' ? 'animate-pulse bg-primary-500' : 'bg-info'}`} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { counts } = useLive();
  const { data: d, error, loading, reload } = useResource((signal) => getDashboard(signal), []);
  const firstName = admin?.name?.split(' ')[0];
  const today = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{today}</div>
        <h1 className="text-3xl font-semibold uppercase text-text">{greeting()}{firstName ? `, ${firstName}` : ''}</h1>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Online agora" value={counts.online} hint="motoristas disponíveis" icon={HiOutlineStatusOnline} onClick={() => navigate('/mapa')} />
        <StatCard label="Pendentes" value={counts.pending} hint="esperando motorista" icon={HiOutlineClock} pulse={counts.pending > 0} highlight={counts.pending > 0} onClick={() => navigate('/corridas?lista=pendentes')} />
        <StatCard label="Em andamento" value={loading && !d ? '…' : d?.inProgressRides ?? 0} hint="passageiro a bordo" icon={HiOutlineLightningBolt} onClick={() => navigate('/corridas?lista=em-andamento')} />
        <StatCard label="Concluídas" value={loading && !d ? '…' : d?.completedRides ?? 0} hint="desde o início" icon={HiOutlineCheckCircle} onClick={() => navigate('/corridas?lista=concluidas')} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Hoje', d?.completedRidesPerDayTotalValue],
              ['Esta semana', d?.completedRidesPerWeekTotalValue],
              ['Este mês', d?.completedRidesPerMonthTotalValue],
            ].map(([label, value], i) => (
              <div key={label} className={`relative overflow-hidden rounded-xl border p-4 ${i === 2 ? 'border-[#0b0b0b] bg-[#0b0b0b] text-[#f7f3e8] dark:border-primary-500/40' : 'border-border bg-surface'}`}>
                {i === 2 && <div className="absolute inset-x-0 top-0 h-1.5 bg-checker" style={{ backgroundSize: '12px 12px' }} aria-hidden="true" />}
                <div className={`text-xs font-semibold uppercase tracking-wider ${i === 2 ? 'text-[#ffcc1a]' : 'text-text-soft'}`}>Faturamento · {label}</div>
                <div className="mt-2 font-display text-2xl font-semibold tabular-nums">{loading && !d ? '…' : formatMoney(value)}</div>
              </div>
            ))}
          </div>
          <MonthlyReport />
        </div>

        <div className="space-y-6">
          <PendingNow />
          <Card title="Cadastros">
            <div className="grid grid-cols-2 gap-4">
              <Link to="/passageiros" className="group">
                <HiOutlineUserGroup className="h-5 w-5 text-accent" />
                <div className="mt-1 font-display text-3xl font-semibold text-text">{d?.registeredPassengers ?? '…'}</div>
                <div className="text-xs text-text-soft group-hover:text-text">passageiros</div>
              </Link>
              <Link to="/motoristas" className="group">
                <HiOutlineIdentification className="h-5 w-5 text-accent" />
                <div className="mt-1 font-display text-3xl font-semibold text-text">{d?.registeredDrivers ?? '…'}</div>
                <div className="text-xs text-text-soft group-hover:text-text">motoristas</div>
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
              <Link to="/corridas?lista=canceladas-motorista" className="text-text-soft hover:text-text">
                <b className="block font-display text-xl text-danger">{d?.cancelledRides ?? '…'}</b>canceladas pelo motorista
              </Link>
              <Link to="/corridas?lista=canceladas-passageiro" className="text-text-soft hover:text-text">
                <b className="block font-display text-xl text-text">{d?.solicitedRides ?? '…'}</b>canceladas pelo passageiro
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
