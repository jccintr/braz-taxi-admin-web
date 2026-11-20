import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Modal, ModalBody, ModalHeader, TextInput, ToggleSwitch } from 'flowbite-react';
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineMail, HiOutlinePhone, HiOutlineIdentification } from 'react-icons/hi';
import { getPassenger, getPassengerRides, updatePassenger } from '../../api/adminApi';
import { errorMessage } from '../../api/client';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Stars from '../../components/ui/Stars';
import ToneBadge from '../../components/ui/ToneBadge';
import Field from '../../components/ui/Field';
import LoadingButton from '../../components/ui/LoadingButton';
import { ErrorState, Loading } from '../../components/ui/States';
import RideHistory from '../../components/RideHistory';
import StatsStrip from '../../components/StatsStrip';
import { formatDate, formatPhone, whatsappUrl } from '../../lib/format';
import { rideStats } from '../../lib/rides';

function EditModal({ passenger, show, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({ name: passenger.name ?? '', telefone: passenger.telefone ?? '', doc: passenger.doc ?? '', ativo: passenger.ativo !== false }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.telefone.trim()) { setError('Nome e telefone são obrigatórios.'); return; }
    setSaving(true); setError('');
    try {
      await updatePassenger(passenger._id, { ...form, name: form.name.trim(), telefone: form.telefone.trim(), doc: form.doc.trim() });
      toast.success('Passageiro atualizado.');
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onClose={saving ? undefined : onClose} size="md">
      <ModalHeader>Editar passageiro</ModalHeader>
      <ModalBody>
        <form onSubmit={save} className="space-y-4" noValidate>
          {error && <Alert color="failure">{error}</Alert>}
          <Field id="p-name" label="Nome"><TextInput id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} /></Field>
          <Field id="p-tel" label="Telefone"><TextInput id="p-tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} disabled={saving} /></Field>
          <Field id="p-doc" label="Documento"><TextInput id="p-doc" value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} disabled={saving} /></Field>
          <ToggleSwitch checked={form.ativo} onChange={(v) => setForm({ ...form, ativo: v })} label={form.ativo ? 'Ativo: pode pedir corridas' : 'Bloqueado: não pode pedir corridas'} disabled={saving} />
          <div className="flex justify-end gap-2 pt-2">
            <Button color="light" onClick={onClose} disabled={saving}>Cancelar</Button>
            <LoadingButton type="submit" loading={saving}>Salvar</LoadingButton>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

export default function PassageiroDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const passenger = useResource((signal) => getPassenger(id, signal), [id]);
  const history = useResource((signal) => getPassengerRides(id, signal), [id]);
  const [editing, setEditing] = useState(false);

  if (passenger.loading && !passenger.data) return <Loading />;
  if (passenger.error) return <ErrorState message={passenger.error} onRetry={passenger.reload} />;
  const p = passenger.data;
  if (!p) return <ErrorState message="Passageiro não encontrado." />;
  const rides = history.data?.rides ?? [];

  const contact = [
    [HiOutlinePhone, 'Telefone / WhatsApp', formatPhone(p.telefone), whatsappUrl(p.telefone)],
    [HiOutlineMail, 'Email', p.email, `mailto:${p.email}`],
    [HiOutlineIdentification, 'Documento', p.doc || '—', null],
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button color="light" size="sm" onClick={() => navigate('/passageiros')} aria-label="Voltar"><HiOutlineArrowLeft className="h-4 w-4" /></Button>
          <Avatar src={p.avatar} name={p.name} size="size-16" />
          <div>
            <h1 className="text-3xl font-semibold uppercase text-text">{p.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Stars value={p.rating} />
              {p.ativo === false ? <ToneBadge tone="danger" dot>Bloqueado</ToneBadge> : <ToneBadge tone="success" dot>Ativo</ToneBadge>}
              {history.data?.passenger?.createdAt && <span className="text-xs text-text-soft">cliente desde {formatDate(history.data.passenger.createdAt)}</span>}
            </div>
          </div>
        </div>
        <Button onClick={() => setEditing(true)}><HiOutlinePencil className="mr-1.5 h-4 w-4" />Editar</Button>
      </div>

      {history.error ? <ErrorState message={history.error} onRetry={history.reload} /> : history.loading && !history.data ? <Loading className="py-6" /> : <StatsStrip stats={rideStats(rides)} moneyLabel="Gasto" />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Contato" bodyClassName="px-5 py-2">
          {contact.map(([Icon, label, value, href]) => (
            <div key={label} className="flex items-center gap-3 py-2.5">
              <Icon className="h-5 w-5 text-text-soft" />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-soft">{label}</div>
                {href ? <a href={href} target="_blank" rel="noreferrer" className="block truncate text-sm text-text hover:text-accent">{value}</a> : <div className="text-sm text-text">{value}</div>}
              </div>
            </div>
          ))}
        </Card>
        <div className="lg:col-span-2">{history.data && <RideHistory rides={rides} counterpart="driver" />}</div>
      </div>

      {editing && <EditModal passenger={p} show={editing} onClose={() => setEditing(false)} onSaved={passenger.reload} />}
    </div>
  );
}
