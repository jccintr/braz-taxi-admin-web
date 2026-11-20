import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, ToggleSwitch } from 'flowbite-react';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineBell, HiOutlineClipboardCopy, HiOutlineMail, HiOutlinePhone, HiOutlineIdentification } from 'react-icons/hi';
import { getDriver, getDriverRides, toggleDriverOnline } from '../../api/adminApi';
import { errorMessage } from '../../api/client';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../context/ToastContext';
import { useLive } from '../../context/LiveContext';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Stars from '../../components/ui/Stars';
import ToneBadge from '../../components/ui/ToneBadge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { ErrorState, Loading } from '../../components/ui/States';
import RideHistory from '../../components/RideHistory';
import StatsStrip from '../../components/StatsStrip';
import PushModal from '../../components/PushModal';
import { formatDate, formatPhone, whatsappUrl } from '../../lib/format';
import { rideStats } from '../../lib/rides';

function InfoRow({ icon: Icon, label, value, href, copy }) {
  const toast = useToast();
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-5 w-5 shrink-0 text-text-soft" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-text-soft">{label}</div>
        {href ? <a href={href} target="_blank" rel="noreferrer" className="block truncate text-sm text-text hover:text-accent">{value}</a> : <div className="truncate text-sm text-text">{value || '—'}</div>}
      </div>
      {copy && value && (
        <button type="button" onClick={() => navigator.clipboard?.writeText(copy).then(() => toast.success('Copiado.'))} className="rounded p-1 text-text-soft hover:bg-surface-alt hover:text-text" aria-label={`Copiar ${label}`}>
          <HiOutlineClipboardCopy className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function MotoristaDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: live, refresh } = useLive();
  const driver = useResource((signal) => getDriver(id, signal), [id]);
  const history = useResource((signal) => getDriverRides(id, signal), [id]);
  const [push, setPush] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [onlineOverride, setOnlineOverride] = useState(null);

  if (driver.loading && !driver.data) return <Loading />;
  if (driver.error) return <ErrorState message={driver.error} onRetry={driver.reload} />;
  const d = driver.data;
  if (!d) return <ErrorState message="Motorista não encontrado." />;

  // /admin/drivers/:id não devolve "online"; o pulso da operação sabe quem está online agora
  const online = onlineOverride ?? Boolean(live?.drivers?.some((x) => x._id === id));
  const rides = history.data?.rides ?? [];
  const stats = rideStats(rides);

  const doToggle = async () => {
    setToggling(true);
    try {
      const res = await toggleDriverOnline(id);
      setOnlineOverride(res.online);
      toast.success(res.online ? `${d.name} agora está online.` : `${d.name} foi colocado offline.`);
      refresh();
      setConfirmToggle(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button color="light" size="sm" onClick={() => navigate('/motoristas')} aria-label="Voltar"><HiOutlineArrowLeft className="h-4 w-4" /></Button>
          <Avatar src={d.avatar} name={d.name} size="size-16" online={online} />
          <div>
            <h1 className="text-3xl font-semibold uppercase text-text">{d.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Stars value={d.rating} />
              {d.ativo === false ? <ToneBadge tone="danger" dot>Bloqueado</ToneBadge> : <ToneBadge tone="success" dot>Ativo</ToneBadge>}
              {history.data?.driver?.createdAt && <span className="text-xs text-text-soft">desde {formatDate(history.data.driver.createdAt)}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 rounded-lg border border-border bg-surface px-3 py-2">
            <ToggleSwitch checked={online} onChange={() => setConfirmToggle(true)} label={online ? 'Online' : 'Offline'} disabled={toggling} />
          </div>
          <Button color="light" onClick={() => setPush(true)}><HiOutlineBell className="mr-1.5 h-4 w-4" />Notificar</Button>
          <Button as={Link} to={`/motoristas/${id}/editar`}><HiOutlinePencil className="mr-1.5 h-4 w-4" />Editar</Button>
        </div>
      </div>

      {history.error ? <ErrorState message={history.error} onRetry={history.reload} /> : history.loading && !history.data ? <Loading className="py-6" /> : <StatsStrip stats={stats} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card title="Contato" bodyClassName="px-5 py-2">
            <InfoRow icon={HiOutlinePhone} label="Telefone / WhatsApp" value={formatPhone(d.telefone)} href={whatsappUrl(d.telefone)} />
            <InfoRow icon={HiOutlineMail} label="Email" value={d.email} href={`mailto:${d.email}`} />
            <InfoRow icon={HiOutlineIdentification} label="Documento" value={d.doc} copy={d.doc} />
          </Card>
          <Card title="Veículo">
            {d.veiculo?.modelo ? (
              <div className="flex items-center justify-between gap-3">
                <div><p className="font-semibold text-text">{d.veiculo.modelo}</p><p className="text-sm text-text-soft">{d.veiculo.cor}</p></div>
                {d.veiculo.placa && <span className="rounded-md border-2 border-text px-2.5 py-1 font-display text-lg font-semibold uppercase tracking-widest text-text">{d.veiculo.placa}</span>}
              </div>
            ) : <p className="text-sm text-text-soft">Não informado.</p>}
          </Card>
          <Card title="Pix para repasse" bodyClassName="px-5 py-2">
            <InfoRow icon={HiOutlineIdentification} label="Favorecido" value={d.pix?.favorecido} />
            <InfoRow icon={HiOutlineClipboardCopy} label="Chave" value={d.pix?.chave} copy={d.pix?.chave} />
          </Card>
        </div>
        <div className="lg:col-span-2">
          {history.data && <RideHistory rides={rides} counterpart="passenger" />}
        </div>
      </div>

      <PushModal driver={d && { ...d, _id: id }} show={push} onClose={() => setPush(false)} />
      <ConfirmModal
        show={confirmToggle}
        title={online ? 'Colocar offline?' : 'Colocar online?'}
        message={online
          ? `${d.name} deixa de receber corridas até ficar online de novo pelo app (ou por aqui). Use quando o motorista esqueceu o app aberto.`
          : `${d.name} passa a aparecer como disponível para receber corridas.`}
        confirmLabel={online ? 'Colocar offline' : 'Colocar online'}
        confirmColor={online ? 'red' : 'default'}
        loading={toggling}
        onConfirm={doToggle}
        onCancel={() => setConfirmToggle(false)}
      />
    </div>
  );
}
