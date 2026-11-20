import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi';

const ToastContext = createContext(null);

const STYLE = {
  success: { icon: HiCheckCircle, cls: 'text-success' },
  error: { icon: HiExclamationCircle, cls: 'text-danger' },
  info: { icon: HiInformationCircle, cls: 'text-accent' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type, message, ms = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    if (ms) setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m, 6000),
    info: (m) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[3000] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0" aria-live="polite">
        {toasts.map((t) => {
          const { icon: Icon, cls } = STYLE[t.type];
          return (
            <div key={t.id} className="pointer-events-auto flex animate-fade-up items-start gap-3 rounded-xl border border-border bg-surface p-3 shadow-lg">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} />
              <p className="flex-1 text-sm text-text">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} className="text-text-soft hover:text-text" aria-label="Fechar aviso">
                <HiX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de um ToastProvider');
  return ctx;
}
