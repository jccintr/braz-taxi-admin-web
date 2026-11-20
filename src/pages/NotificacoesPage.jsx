import { useMemo, useState } from 'react';
import { Alert, Select, TextInput, Textarea } from 'flowbite-react';
import { HiOutlineSpeakerphone, HiOutlineUser } from 'react-icons/hi';
import { listDrivers, pushToAllDrivers, pushToDriver } from '../api/adminApi';
import { errorMessage } from '../api/client';
import { useResource } from '../hooks/useResource';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import LoadingButton from '../components/ui/LoadingButton';
import ConfirmModal from '../components/ui/ConfirmModal';
import PhonePreview from '../components/PhonePreview';
import { formatDateTime } from '../lib/format';

const HISTORY_KEY = 'braz:push-history';
const TEMPLATES = [
  { label: 'Movimento alto', title: 'Muita procura agora! 🚕', body: 'Tem passageiro pedindo corrida. Fique online para atender.' },
  { label: 'Atualizar app', title: 'Nova versão do app', body: 'Atualize o Braz Taxi Motorista para continuar recebendo corridas sem problemas.' },
  { label: 'Evento na cidade', title: 'Evento hoje na cidade', body: 'Vai ter movimento à noite. Quem puder, fique online a partir das 19h.' },
  { label: 'Lembrete', title: 'Lembrete importante', body: 'Mantenha o app aberto durante o expediente para receber as corridas.' },
];

const readHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? []; } catch { return []; } };

export default function NotificacoesPage() {
  const toast = useToast();
  const { data: drivers } = useResource((signal) => listDrivers(signal), []);
  const [mode, setMode] = useState('todos');
  const [driverId, setDriverId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState(readHistory);

  const reachable = useMemo(() => (drivers ?? []).filter((d) => d.pushToken), [drivers]);
  const target = reachable.find((d) => d._id === driverId);

  const ask = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError('Preencha o título e a mensagem.'); return; }
    if (mode === 'um' && !target) { setError('Escolha o motorista.'); return; }
    setError('');
    setConfirm(true);
  };

  const send = async () => {
    setSending(true);
    try {
      if (mode === 'todos') await pushToAllDrivers(title.trim(), body.trim());
      else await pushToDriver(driverId, title.trim(), body.trim());
      const entry = { at: new Date().toISOString(), title: title.trim(), body: body.trim(), to: mode === 'todos' ? `Todos (${reachable.length})` : target.name };
      const next = [entry, ...history].slice(0, 15);
      setHistory(next);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* sem storage */ }
      toast.success('Notificação enviada.');
      setTitle(''); setBody(''); setConfirm(false);
    } catch (err) {
      setError(errorMessage(err));
      setConfirm(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Notificações" subtitle="Envie um aviso para o celular dos motoristas (push do app Braz Taxi Motorista)." />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <form onSubmit={ask} className="space-y-6 lg:col-span-3" noValidate>
          <Card title="Para quem">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['todos', HiOutlineSpeakerphone, 'Todos os motoristas', drivers ? `${reachable.length} de ${drivers.length} recebem notificação` : 'carregando…'],
                ['um', HiOutlineUser, 'Um motorista', 'escolha na lista'],
              ].map(([k, Icon, l, h]) => (
                <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${mode === k ? 'border-primary-500 bg-primary/10' : 'border-border hover:border-primary-300'}`}>
                  <Icon className="mt-0.5 h-5 w-5 text-accent" />
                  <span><span className="block font-semibold text-text">{l}</span><span className="text-xs text-text-soft">{h}</span></span>
                </button>
              ))}
            </div>
            {mode === 'um' && (
              <Select className="mt-4" value={driverId} onChange={(e) => setDriverId(e.target.value)} aria-label="Motorista">
                <option value="">Escolha o motorista…</option>
                {reachable.map((d) => <option key={d._id} value={d._id}>{d.name}{d.online ? ' · online' : ''}</option>)}
              </Select>
            )}
            {drivers && reachable.length < drivers.length && (
              <p className="mt-3 text-xs text-text-soft">{drivers.length - reachable.length} motorista(s) nunca registraram o aparelho no app e não recebem push.</p>
            )}
          </Card>

          <Card title="Mensagem">
            <div className="mb-4 flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.label} type="button" onClick={() => { setTitle(t.title); setBody(t.body); }} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-soft hover:border-primary-400 hover:text-text">{t.label}</button>
              ))}
            </div>
            <div className="space-y-4">
              {error && <Alert color="failure">{error}</Alert>}
              <Field id="title" label="Título" hint={`${title.length}/60`}><TextInput id="title" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
              <Field id="body" label="Mensagem" hint={`${body.length}/240`}><Textarea id="body" rows={5} maxLength={240} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
              <div className="flex justify-end"><LoadingButton type="submit" loading={sending}>Enviar notificação</LoadingButton></div>
            </div>
          </Card>
        </form>

        <div className="space-y-6 lg:col-span-2">
          <PhonePreview title={title} body={body} />
          {history.length > 0 && (
            <Card title="Enviadas deste navegador" bodyClassName="p-0">
              <ul className="divide-y divide-border">
                {history.map((h) => (
                  <li key={h.at} className="px-5 py-3">
                    <button type="button" className="w-full text-left" onClick={() => { setTitle(h.title); setBody(h.body); }} title="Usar de novo">
                      <p className="truncate text-sm font-semibold text-text">{h.title}</p>
                      <p className="line-clamp-1 text-xs text-text-soft">{h.body}</p>
                      <p className="mt-1 text-[11px] text-text-soft">{formatDateTime(h.at)} · {h.to}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        show={confirm}
        title="Enviar notificação?"
        message={mode === 'todos' ? `Vai para ${reachable.length} motoristas agora. Não dá para cancelar depois de enviada.` : `Vai para ${target?.name}.`}
        confirmLabel="Enviar"
        confirmColor="default"
        loading={sending}
        onConfirm={send}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
