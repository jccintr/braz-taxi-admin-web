import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlineChatAlt2, HiStar } from 'react-icons/hi';
import { deleteRide, getRide } from '../../api/adminApi';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../context/ToastContext';
import { errorMessage } from '../../api/client';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Stars from '../../components/ui/Stars';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { ErrorState, Loading } from '../../components/ui/States';
import { DEFAULT_CENTER, originIcon, destinationIcon, hasPos, toLatLng } from '../../components/map/mapKit';
import { ThemedTiles, FitBounds } from '../../components/map/MapParts';
import { formatDateTime, formatDistance, formatDuration, formatGap, formatMoney, formatTime, formatTimeSec } from '../../lib/format';
import { rideStatus } from '../../lib/rides';

function PersonCard({ role, person, to, ratingGiven, ratingLabel }) {
  return (
    <Card title={role}>
      {person ? (
        <div className="flex items-center gap-4">
          <Avatar src={person.avatar} name={person.name} size="size-14" />
          <div className="min-w-0 flex-1">
            <Link to={to} className="block truncate font-semibold text-text hover:text-accent">{person.name}</Link>
            <Stars value={person.rating} className="mt-0.5" />
          </div>
          {ratingGiven != null && (
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-soft">{ratingLabel}</div>
              <div className="flex items-center justify-end gap-0.5" aria-label={`${ratingGiven} de 5`}>
                {[1, 2, 3, 4, 5].map((n) => <HiStar key={n} className={`h-4 w-4 ${n <= ratingGiven ? 'text-primary-500' : 'text-border'}`} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-soft">Nenhum motorista aceitou esta corrida.</p>
      )}
    </Card>
  );
}

export default function CorridaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: ride, error, loading, reload } = useResource((signal) => getRide(id, signal), [id]);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteRide(id);
      toast.success('Corrida excluída.');
      navigate('/corridas', { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
      setDeleting(false);
    }
  };

  if (loading && !ride) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!ride) return <ErrorState message="Corrida não encontrada." />;

  const status = rideStatus(ride.status);
  const points = [ride.origem, ride.destino].filter(hasPos).map(toLatLng);
  const events = ride.events ?? [];
  const messages = ride.messages ?? [];

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button color="light" size="sm" onClick={() => navigate(-1)} aria-label="Voltar"><HiOutlineArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Corrida · {formatDateTime(ride.data)}</div>
            <h1 className="text-3xl font-semibold uppercase text-text">{status.label}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-display text-3xl font-semibold tabular-nums text-text">{formatMoney(ride.valor)}</div>
            <div className="text-xs text-text-soft">{ride.pagamento?.nome ?? 'pagamento não informado'}</div>
          </div>
        </div>
      </div>

      {ride.status === -2 && ride.motivoCancelamento && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <b>Motivo do cancelamento:</b> {ride.motivoCancelamento}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative h-80 overflow-hidden rounded-xl border border-border sm:h-96">
            <MapContainer center={points[0] ?? DEFAULT_CENTER} zoom={15} className="absolute inset-0" scrollWheelZoom={false}>
              <ThemedTiles />
              <FitBounds points={points} version={1} />
              {points.length === 2 && <Polyline positions={points} pathOptions={{ color: '#ffcc1a', weight: 4, dashArray: '2 10', lineCap: 'round' }} />}
              {hasPos(ride.origem) && <Marker position={toLatLng(ride.origem)} icon={originIcon}><Popup><b>Origem</b><br />{ride.origem.address}</Popup></Marker>}
              {hasPos(ride.destino) && <Marker position={toLatLng(ride.destino)} icon={destinationIcon}><Popup><b>Destino</b><br />{ride.destino.address}</Popup></Marker>}
            </MapContainer>
          </div>

          <Card bodyClassName="p-0">
            <ol className="relative">
              <li className="flex gap-4 px-5 py-4">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#13804a] font-display text-sm font-bold text-white">A</span>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-text-soft">Origem</div><p className="text-sm text-text">{ride.origem?.address ?? '—'}</p></div>
              </li>
              <li className="flex gap-4 border-t border-border px-5 py-4">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0b0b0b] font-display text-sm font-bold text-[#ffcc1a]">B</span>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-text-soft">Destino</div><p className="text-sm text-text">{ride.destino?.address ?? '—'}</p></div>
              </li>
            </ol>
            <dl className="grid grid-cols-3 border-t border-border">
              {[
                ['Distância', formatDistance(ride.distancia)],
                ['Duração est.', formatDuration(ride.duracao)],
                // Plataforma alugada: não há taxa por corrida, o motorista recebe o valor integral.
                ['Motorista recebe', formatMoney(ride.valor ?? 0)],
              ].map(([k, v], i) => (
                <div key={k} className={`px-5 py-4 ${i ? 'border-l border-border' : ''}`}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-text-soft">{k}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-text">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {messages.length > 0 && (
            <Card title={`Conversa no app (${messages.length})`}>
              <div className="mb-3 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-text-soft">
                <span>Passageiro</span><span>Motorista</span>
              </div>
              <div className="space-y-3">
                {messages.map((m, i) => {
                  const fromPassenger = m.sender === 'Passenger';
                  return (
                    <div key={i} className={`flex ${fromPassenger ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${fromPassenger ? 'rounded-tl-sm bg-surface-alt text-text' : 'rounded-tr-sm bg-primary text-primary-ink'}`}>
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        <span className="mt-1 block text-right text-[10px] opacity-60">{formatTime(m.sentAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <PersonCard role="Passageiro" person={ride.passenger} to={`/passageiros/${ride.passenger?._id}`} ratingGiven={ride.passengerRating} ratingLabel="nota recebida" />
          <PersonCard role="Motorista" person={ride.driver} to={`/motoristas/${ride.driver?._id}`} ratingGiven={ride.driverRating} ratingLabel="nota recebida" />
          {ride.veiculo?.modelo && (
            <Card title="Veículo">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-text">{ride.veiculo.modelo}</p>
                  <p className="text-sm text-text-soft">{ride.veiculo.cor}</p>
                </div>
                {ride.veiculo.placa && (
                  <span className="rounded-md border-2 border-text bg-surface px-2.5 py-1 font-display text-lg font-semibold uppercase tracking-widest text-text">{ride.veiculo.placa}</span>
                )}
              </div>
            </Card>
          )}

          <Card title="Linha do tempo">
            {events.length === 0 ? <p className="text-sm text-text-soft">Sem eventos.</p> : (
              <ol className="relative space-y-4 border-l-2 border-border pl-5">
                {events.map((e, i) => {
                  const isLast = i === events.length - 1;
                  const cancelled = /cancelad/i.test(e.descricao ?? '');
                  return (
                    <li key={i} className="relative">
                      <span className={`absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-surface ${cancelled ? 'bg-danger' : isLast ? 'bg-primary-500' : 'bg-gray-400'}`} />
                      <p className="text-sm font-medium text-text">{e.descricao}</p>
                      <p className="text-xs text-text-soft">
                        {formatTimeSec(e.data)}
                        {i > 0 && <span className="ml-2 rounded bg-surface-alt px-1.5 py-0.5">+{formatGap(events[i - 1].data, e.data)}</span>}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
            {messages.length > 0 && <p className="mt-4 flex items-center gap-1.5 text-xs text-text-soft"><HiOutlineChatAlt2 className="h-4 w-4" />{messages.length} mensagens trocadas no app</p>}
          </Card>

          <div className="rounded-xl border border-dashed border-danger/40 p-4">
            <p className="text-sm text-text-soft">Excluir apaga a corrida do histórico de todos (passageiro, motorista e relatórios).</p>
            <Button color="red" size="sm" className="mt-3" onClick={() => setConfirm(true)}><HiOutlineTrash className="mr-1.5 h-4 w-4" />Excluir corrida</Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirm}
        title="Excluir corrida?"
        message={<>A corrida de <b>{ride.passenger?.name}</b> em {formatDateTime(ride.data)} ({formatMoney(ride.valor)}) será apagada. Não dá para desfazer.</>}
        confirmLabel="Excluir"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => { setConfirm(false); setDeleteError(''); }}
      />
    </div>
  );
}
