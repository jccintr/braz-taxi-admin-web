import { Alert, Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import LoadingButton from './LoadingButton';

export default function ConfirmModal({ show, title, message, confirmLabel = 'Confirmar', confirmColor = 'red', loading = false, error = '', onConfirm, onCancel }) {
  return (
    <Modal show={show} onClose={loading ? undefined : onCancel} size="md" dismissible={!loading}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          {error && <Alert color="failure">{error}</Alert>}
          <div className="text-sm text-text-soft">{message}</div>
          <div className="flex justify-end gap-2">
            <Button color="light" onClick={onCancel} disabled={loading}>Cancelar</Button>
            <LoadingButton color={confirmColor} onClick={onConfirm} loading={loading}>{confirmLabel}</LoadingButton>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
