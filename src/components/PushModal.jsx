import { useState } from 'react';
import { Alert, Button, Modal, ModalBody, ModalHeader, TextInput, Textarea } from 'flowbite-react';
import LoadingButton from './ui/LoadingButton';
import Field from './ui/Field';
import PhonePreview from './PhonePreview';
import { pushToDriver } from '../api/adminApi';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

/** Notificação push para UM motorista (rota sendPushMessage). */
export default function PushModal({ driver, show, onClose }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const send = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError('Preencha o título e a mensagem.'); return; }
    setSending(true); setError('');
    try {
      await pushToDriver(driver._id, title.trim(), body.trim());
      toast.success(`Notificação enviada para ${driver.name}.`);
      setTitle(''); setBody(''); onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onClose={sending ? undefined : onClose} size="3xl">
      <ModalHeader>Notificar {driver?.name}</ModalHeader>
      <ModalBody>
        <form onSubmit={send} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {error && <Alert color="failure">{error}</Alert>}
            <Field id="push-title" label="Título"><TextInput id="push-title" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} disabled={sending} /></Field>
            <Field id="push-body" label="Mensagem" hint={`${body.length}/240`}><Textarea id="push-body" rows={5} maxLength={240} value={body} onChange={(e) => setBody(e.target.value)} disabled={sending} /></Field>
            <div className="flex justify-end gap-2">
              <Button color="light" onClick={onClose} disabled={sending}>Cancelar</Button>
              <LoadingButton type="submit" loading={sending}>Enviar</LoadingButton>
            </div>
          </div>
          <PhonePreview title={title} body={body} compact />
        </form>
      </ModalBody>
    </Modal>
  );
}
