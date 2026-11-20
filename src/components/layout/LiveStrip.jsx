import { Link } from 'react-router-dom';
import { HiOutlineRefresh } from 'react-icons/hi';
import { useLive } from '../../context/LiveContext';
import { formatTime } from '../../lib/format';

// "Letreiro" da operação no topo: online, pendentes, em atendimento, última atualização.
export default function LiveStrip() {
  const { counts, updatedAt, loading, refresh, error } = useLive();
  return (
    <div className="hidden items-center gap-1 rounded-full border border-border bg-surface-alt p-1 text-xs font-medium lg:flex">
      <Link to="/mapa" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-text hover:bg-surface" title="Motoristas online agora">
        <span className="relative flex size-2">
          {counts.online > 0 && <span className="absolute inset-0 animate-ping-slow rounded-full bg-success" />}
          <span className={`relative size-2 rounded-full ${counts.online > 0 ? 'bg-success' : 'bg-gray-400'}`} />
        </span>
        <b className="tabular-nums">{counts.online}</b> online
      </Link>
      <Link
        to="/corridas?lista=pendentes"
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${counts.pending ? 'bg-primary text-primary-ink' : 'text-text hover:bg-surface'}`}
        title="Corridas esperando motorista"
      >
        <b className="tabular-nums">{counts.pending}</b> {counts.pending === 1 ? 'pendente' : 'pendentes'}
      </Link>
      <Link to="/corridas?lista=aceitas" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-text hover:bg-surface" title="Corridas aceitas, motorista indo buscar">
        <b className="tabular-nums">{counts.accepted}</b> em atendimento
      </Link>
      <button
        type="button"
        onClick={refresh}
        className={`flex items-center gap-1 rounded-full px-2 py-1 ${error ? 'text-danger' : 'text-text-soft'} hover:bg-surface`}
        title={error ? `Falha ao atualizar: ${error}` : 'Atualiza sozinho a cada 20 s. Clique para atualizar agora.'}
      >
        <HiOutlineRefresh className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span className="tabular-nums">{updatedAt ? formatTime(updatedAt) : '--:--'}</span>
      </button>
    </div>
  );
}
