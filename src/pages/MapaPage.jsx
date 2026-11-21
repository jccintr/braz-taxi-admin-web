import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import { HiOutlineRefresh, HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from 'react-icons/hi';
import { useLive } from '../context/LiveContext';
import { listDrivers } from '../api/adminApi';
import { useResource } from '../hooks/useResource';
import { DEFAULT_CENTER, driverIcon, pendingIcon, acceptedIcon, hasPos, toLatLng } from '../components/map/mapKit';
import { ThemedTiles, FitBounds, FlyTo } from '../components/map/MapParts';
import Avatar from '../components/ui/Avatar';
import { formatTime, timeAgo } from '../lib/format';

const LAYERS = [
  { key: 'drivers', label: 'Motoristas', dot: 'bg-success' },
  { key: 'pending', label: 'Pendentes', dot: 'bg-primary-500' },
  { key: 'accepted', label: 'Aceitas', dot: 'bg-info' },
];

export default function MapaPage() {
  const { data, loading, refresh, updatedAt, error } = useLive();
  const [layers, setLayers] = useState({ drivers: true, pending: true, accepted: true });
  const [panel, setPanel] = useState(true);
  const [target, setTarget] = useState(null);
  const markers = useRef({});

  // O GET /admin/map não traz a foto dos motoristas: buscamos a lista completa (a mesma da tela
  // Motoristas, que tem o avatar) e completamos cada motorista do mapa pelo _id.
  const { data: allDrivers } = useResource((signal) => listDrivers(signal), []);
  const avatarById = useMemo(
    () => Object.fromEntries((allDrivers ?? []).filter((d) => d.avatar).map((d) => [d._id, d.avatar])),
    [allDrivers],
  );
  const drivers = useMemo(
    () => (data?.drivers ?? [])
      .filter((d) => hasPos(d.position))
      .map((d) => (d.avatar || !avatarById[d._id] ? d : { ...d, avatar: avatarById[d._id] })),
    [data, avatarById],
  );
  const pending = useMemo(() => data?.pendingRides ?? [], [data]);
  const accepted = useMemo(() => data?.acceptedRides ?? [], [data]);
  const driverById = useMemo(() => Object.fromEntries(drivers.map((d) => [d._id, d])), [drivers]);

  const allPoints = useMemo(() => [
    ...drivers.map((d) => toLatLng(d.position)),
    ...pending.filter((r) => hasPos(r.origem)).map((r) => toLatLng(r.origem)),
    ...accepted.filter((r) => hasPos(r.origem)).map((r) => toLatLng(r.origem)),
  ], [drivers, pending, accepted]);
  const fitVersion = data ? 1 : 0; // enquadra uma vez, quando os dados chegam

  const focus = (id, position) => {
    setTarget({ id, position, at: Date.now() });
    setTimeout(() => markers.current[id]?.openPopup(), 850);
  };

  return (
    <div className="relative isolate flex min-h-[calc(100vh-4rem)] flex-1">
      {/* painel lateral */}
      <aside className={`absolute inset-y-0 left-0 z-[1000] flex w-80 max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl transition-transform md:static md:shadow-none ${panel ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold uppercase text-text">Mapa ao vivo</h1>
            <button type="button" onClick={() => setPanel(false)} className="rounded p-1 text-text-soft hover:bg-surface-alt" aria-label="Recolher painel">
              <HiOutlineChevronDoubleLeft className="h-5 w-5" />
            </button>
          </div>
          <p className={`mt-1 text-xs ${error ? 'text-danger' : 'text-text-soft'}`}>
            {error ? `Falha ao atualizar: ${error}` : `Atualiza sozinho a cada 20 s · última às ${updatedAt ? formatTime(updatedAt) : '--:--'}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {LAYERS.map((l) => (
              <button
                key={l.key}
                type="button"
                aria-pressed={layers[l.key]}
                onClick={() => setLayers((s) => ({ ...s, [l.key]: !s[l.key] }))}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${layers[l.key] ? 'border-transparent bg-surface-alt text-text' : 'border-border text-text-soft line-through opacity-60'}`}
              >
                <span className={`size-2 rounded-full ${l.dot}`} />{l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Section title="Pendentes" count={pending.length} empty="Nenhuma corrida esperando.">
            {pending.map((r) => (
              <Row key={r._id} onClick={() => hasPos(r.origem) && focus(r._id, toLatLng(r.origem))} active={target?.id === r._id}
                avatar={<Avatar src={r.passenger?.avatar} name={r.passenger?.name} size="size-8" />}
                title={r.passenger?.name} subtitle={`pediu ${timeAgo(r.data)}`} badge={<span className="size-2.5 animate-pulse rounded-full bg-primary-500" />} />
            ))}
          </Section>
          <Section title="Aceitas" count={accepted.length} empty="Nenhum motorista a caminho.">
            {accepted.map((r) => (
              <Row key={r._id} onClick={() => hasPos(r.origem) && focus(r._id, toLatLng(r.origem))} active={target?.id === r._id}
                avatar={<Avatar src={r.passenger?.avatar} name={r.passenger?.name} size="size-8" />}
                title={r.passenger?.name} subtitle={`${r.driver?.name ?? 'Motorista'} indo buscar`} badge={<span className="size-2.5 rounded-full bg-info" />} />
            ))}
          </Section>
          <Section title="Motoristas online" count={drivers.length} empty="Ninguém online agora.">
            {drivers.map((d) => (
              <Row key={d._id} onClick={() => focus(d._id, toLatLng(d.position))} active={target?.id === d._id}
                avatar={<Avatar src={d.avatar} name={d.name} size="size-8" online />}
                title={d.name} subtitle={[d.veiculo?.modelo, d.veiculo?.cor, d.veiculo?.placa].filter(Boolean).join(' · ') || 'Veículo não informado'} />
            ))}
          </Section>
        </div>
      </aside>

      {/* mapa */}
      <div className="relative flex-1">
        {!panel && (
          <button type="button" onClick={() => setPanel(true)} className="absolute left-3 top-3 z-[1000] flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text shadow" aria-label="Mostrar painel">
            <HiOutlineChevronDoubleRight className="h-4 w-4" /> Lista
          </button>
        )}
        <button type="button" onClick={refresh} disabled={loading} className="absolute right-3 top-3 z-[1000] flex size-10 items-center justify-center rounded-full bg-primary text-primary-ink shadow-lg disabled:opacity-70" aria-label="Atualizar agora" title="Atualizar agora">
          <HiOutlineRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <MapContainer center={DEFAULT_CENTER} zoom={15} className="absolute inset-0" scrollWheelZoom>
          <ThemedTiles />
          <FitBounds points={allPoints} version={fitVersion} />
          <FlyTo target={target} />

          {layers.accepted && accepted.map((r) => {
            const d = r.driver?._id && driverById[r.driver._id];
            return d && hasPos(r.origem) ? (
              <Polyline key={`l-${r._id}`} positions={[toLatLng(d.position), toLatLng(r.origem)]} pathOptions={{ color: '#1f62c4', weight: 3, dashArray: '6 8', opacity: 0.8 }} />
            ) : null;
          })}

          {layers.drivers && drivers.map((d) => (
            <Marker key={d._id} position={toLatLng(d.position)} icon={driverIcon} ref={(m) => { markers.current[d._id] = m; }}>
              <Popup>
                <b>{d.name}</b><br />
                {[d.veiculo?.modelo, d.veiculo?.cor].filter(Boolean).join(' ')}{d.veiculo?.placa ? ` · ${d.veiculo.placa}` : ''}<br />
                <Link to={`/motoristas/${d._id}`}>Ver motorista →</Link>
              </Popup>
            </Marker>
          ))}

          {layers.pending && pending.filter((r) => hasPos(r.origem)).map((r) => (
            <Marker key={r._id} position={toLatLng(r.origem)} icon={pendingIcon} ref={(m) => { markers.current[r._id] = m; }}>
              <Popup>
                <b>{r.passenger?.name}</b> pediu uma corrida<br />
                <span style={{ opacity: 0.7 }}>{timeAgo(r.data)} · esperando motorista</span><br />
                <Link to={`/corridas/${r._id}`}>Ver corrida →</Link>
              </Popup>
            </Marker>
          ))}

          {layers.accepted && accepted.filter((r) => hasPos(r.origem)).map((r) => (
            <Marker key={r._id} position={toLatLng(r.origem)} icon={acceptedIcon} ref={(m) => { markers.current[r._id] = m; }}>
              <Popup>
                <b>{r.passenger?.name}</b><br />
                Aceita por {r.driver?.name ?? 'motorista'}<br />
                <Link to={`/corridas/${r._id}`}>Ver corrida →</Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function Section({ title, count, empty, children }) {
  return (
    <section className="border-b border-border py-2">
      <h2 className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
        {title}<span className="rounded-full bg-surface-alt px-2 py-0.5 tabular-nums text-text">{count}</span>
      </h2>
      {count === 0 ? <p className="px-4 pb-2 text-xs text-text-soft">{empty}</p> : <ul>{children}</ul>}
    </section>
  );
}

function Row({ avatar, title, subtitle, badge, onClick, active }) {
  return (
    <li>
      <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${active ? 'bg-primary/15' : 'hover:bg-surface-alt'}`}>
        {avatar}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-text">{title ?? '—'}</span>
          <span className="block truncate text-xs text-text-soft">{subtitle}</span>
        </span>
        {badge}
      </button>
    </li>
  );
}
