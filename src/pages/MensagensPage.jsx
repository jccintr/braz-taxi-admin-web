import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { HiOutlineInbox, HiOutlineTrash, HiOutlineMail, HiOutlineMailOpen, HiOutlineArrowLeft, HiOutlineUser } from 'react-icons/hi';
import { deleteMessage, listMessages, setMessageRead } from '../api/adminApi';
import { errorMessage } from '../api/client';
import { useResource } from '../hooks/useResource';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import Avatar from '../components/ui/Avatar';
import ToneBadge from '../components/ui/ToneBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ErrorState, Loading, Empty } from '../components/ui/States';
import { formatDateTime, timeAgo } from '../lib/format';

/** Caixa de entrada do "fale conosco" do app do passageiro. Abrir uma mensagem marca como lida. */
export default function MensagensPage() {
  const toast = useToast();
  const { data, error, loading, reload, setData } = useResource((signal) => listMessages(signal), []);
  const [filter, setFilter] = useState('todas');
  const [tipo, setTipo] = useState('');
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const messages = useMemo(() => data ?? [], [data]);
  const tipos = useMemo(() => [...new Set(messages.map((m) => m.tipo).filter(Boolean))], [messages]);
  const unread = messages.filter((m) => !m.lida).length;
  const list = messages.filter((m) => (filter === 'nao-lidas' ? !m.lida : true) && (!tipo || m.tipo === tipo));
  const open = messages.find((m) => m._id === openId);

  const patch = (id, changes) => setData((prev) => prev.map((m) => (m._id === id ? { ...m, ...changes } : m)));

  const setRead = async (m, lida) => {
    patch(m._id, { lida }); // otimista
    try { await setMessageRead(m._id, lida); } catch (err) { patch(m._id, { lida: m.lida }); toast.error(errorMessage(err)); }
  };

  const openMessage = (m) => {
    setOpenId(m._id);
    if (!m.lida) setRead(m, true);
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await deleteMessage(toDelete._id);
      setData((prev) => prev.filter((m) => m._id !== toDelete._id));
      if (openId === toDelete._id) setOpenId(null);
      toast.success('Mensagem excluída.');
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader title="Mensagens" subtitle={unread ? `${unread} ${unread === 1 ? 'mensagem não lida' : 'mensagens não lidas'} dos passageiros.` : 'Fale conosco do app do passageiro.'} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-lg bg-surface-alt p-1">
          {[['todas', 'Todas'], ['nao-lidas', `Não lidas${unread ? ` (${unread})` : ''}`]].map(([k, l]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${filter === k ? 'bg-primary text-primary-ink' : 'text-text hover:bg-surface'}`}>{l}</button>
          ))}
        </div>
        {tipos.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => setTipo('')} className={`rounded-full border px-3 py-1 text-xs font-medium ${!tipo ? 'border-primary-500 text-accent' : 'border-border text-text-soft'}`}>Todos os assuntos</button>
            {tipos.map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)} className={`rounded-full border px-3 py-1 text-xs font-medium ${tipo === t ? 'border-primary-500 text-accent' : 'border-border text-text-soft'}`}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : messages.length === 0 ? (
        <Empty icon={HiOutlineInbox}>Nenhuma mensagem recebida.</Empty>
      ) : (
        <div className="grid min-h-[60vh] overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-5">
          <ul className={`divide-y divide-border overflow-y-auto border-border lg:col-span-2 lg:max-h-[70vh] lg:border-r ${open ? 'hidden lg:block' : ''}`}>
            {list.length === 0 && <li className="px-5 py-10 text-center text-sm text-text-soft">Nada por aqui.</li>}
            {list.map((m) => (
              <li key={m._id}>
                <button type="button" onClick={() => openMessage(m)} className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${openId === m._id ? 'bg-primary/15' : 'hover:bg-surface-alt'}`}>
                  <span className="relative">
                    <Avatar src={m.passenger?.avatar} name={m.passenger?.name} size="size-9" />
                    {!m.lida && <span className="absolute -left-1 -top-1 size-3 rounded-full bg-primary-500 ring-2 ring-surface" aria-label="não lida" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${m.lida ? 'text-text' : 'font-bold text-text'}`}>{m.passenger?.name ?? 'Passageiro removido'}</span>
                      <span className="shrink-0 text-[11px] text-text-soft">{timeAgo(m.data)}</span>
                    </span>
                    <span className="block text-xs font-semibold text-accent">{m.tipo}</span>
                    <span className="line-clamp-1 text-xs text-text-soft">{m.message}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className={`lg:col-span-3 ${open ? '' : 'hidden lg:flex'} flex-col`}>
            {open ? (
              <article className="flex h-full flex-col">
                <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                  <button type="button" onClick={() => setOpenId(null)} className="rounded p-1 text-text-soft hover:bg-surface-alt lg:hidden" aria-label="Voltar para a lista"><HiOutlineArrowLeft className="h-5 w-5" /></button>
                  <Avatar src={open.passenger?.avatar} name={open.passenger?.name} size="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">{open.passenger?.name ?? 'Passageiro removido'}</p>
                    <p className="text-xs text-text-soft">{formatDateTime(open.data)}</p>
                  </div>
                  <ToneBadge tone="primary">{open.tipo}</ToneBadge>
                </header>
                <p className="flex-1 whitespace-pre-wrap break-words px-5 py-6 text-[15px] leading-relaxed text-text">{open.message}</p>
                <footer className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
                  {open.passenger?._id && <Button as={Link} to={`/passageiros/${open.passenger._id}`} color="light" size="sm"><HiOutlineUser className="mr-1.5 h-4 w-4" />Ver passageiro</Button>}
                  <Button color="light" size="sm" onClick={() => setRead(open, !open.lida)}>
                    {open.lida ? <><HiOutlineMail className="mr-1.5 h-4 w-4" />Marcar como não lida</> : <><HiOutlineMailOpen className="mr-1.5 h-4 w-4" />Marcar como lida</>}
                  </Button>
                  <Button color="red" size="sm" className="ml-auto" onClick={() => setToDelete(open)}><HiOutlineTrash className="mr-1.5 h-4 w-4" />Excluir</Button>
                </footer>
              </article>
            ) : (
              <div className="m-auto flex flex-col items-center gap-2 p-10 text-sm text-text-soft">
                <HiOutlineInbox className="h-10 w-10 opacity-50" />Escolha uma mensagem para ler.
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Excluir mensagem?"
        message={`A mensagem de ${toDelete?.passenger?.name ?? 'passageiro'} será apagada.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
