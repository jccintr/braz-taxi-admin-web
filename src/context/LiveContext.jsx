import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMapData } from '../api/adminApi';
import { errorMessage } from '../api/client';
import { useToast } from './ToastContext';

/**
 * "Pulso" da operação: consulta GET /admin/map a cada 20 s (só com a aba visível) e compartilha
 * com o painel inteiro — o mapa ao vivo, a barra superior (online / pendentes) e o alerta de
 * corrida nova. Quando aparece uma corrida pendente que ainda não tinha sido vista, o painel avisa
 * (aviso na tela + som e notificação do navegador, se o operador ligar).
 */
const LiveContext = createContext(null);
const INTERVAL_MS = 20_000;
const ALERTS_KEY = 'braz:alerts';

const readAlerts = () => {
  try { return { sound: false, desktop: false, ...JSON.parse(localStorage.getItem(ALERTS_KEY)) }; } catch { return { sound: false, desktop: false }; }
};

// "Ding-dong" curtinho gerado na hora (sem arquivo de áudio).
function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [[880, 0], [660, 0.18]].forEach(([freq, at]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch { /* navegador sem áudio */ }
}

export function LiveProvider({ children }) {
  const toast = useToast();
  const [data, setData] = useState(null); // { drivers, pendingRides, acceptedRides }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [alerts, setAlertsState] = useState(readAlerts);
  const seenPending = useRef(null); // Set de ids; null = ainda não carregou (não alerta na 1ª carga)
  const alertsRef = useRef(alerts);
  useEffect(() => { alertsRef.current = alerts; }, [alerts]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMapData();
      const pending = result?.pendingRides ?? [];
      if (seenPending.current) {
        const fresh = pending.filter((r) => !seenPending.current.has(r._id));
        if (fresh.length) {
          const who = fresh[0].passenger?.name ?? 'Um passageiro';
          const msg = fresh.length === 1 ? `${who} pediu uma corrida agora.` : `${fresh.length} corridas novas aguardando motorista.`;
          toast.info(msg);
          if (alertsRef.current.sound) chime();
          if (alertsRef.current.desktop && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
            new Notification('Braz Taxi · corrida pendente', { body: msg, icon: '/favicon.png', tag: 'braz-pending' });
          }
        }
      }
      seenPending.current = new Set(pending.map((r) => r._id));
      setData(result);
      setError('');
      setUpdatedAt(new Date());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
    let timer = setInterval(() => { if (!document.hidden) refresh(); }, INTERVAL_MS);
    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(timer); timer = null; document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh]);

  const setAlerts = useCallback(async (changes) => {
    const next = { ...alertsRef.current, ...changes };
    if (changes.desktop && 'Notification' in window && Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') next.desktop = false;
    }
    if (changes.sound) chime(); // toca uma vez para o operador conhecer o som
    try { localStorage.setItem(ALERTS_KEY, JSON.stringify(next)); } catch { /* sem storage */ }
    setAlertsState(next);
  }, []);

  const value = useMemo(() => ({
    data,
    error,
    loading,
    updatedAt,
    refresh,
    alerts,
    setAlerts,
    counts: {
      online: data?.drivers?.length ?? 0,
      pending: data?.pendingRides?.length ?? 0,
      accepted: data?.acceptedRides?.length ?? 0,
    },
  }), [data, error, loading, updatedAt, refresh, alerts, setAlerts]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive precisa estar dentro de um LiveProvider');
  return ctx;
}
