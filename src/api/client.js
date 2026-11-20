// Em dev, VITE_API_URL fica vazio e o Vite faz proxy de /api (sem CORS). Em produção aponte para a API.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const SESSION_KEY = 'braz:admin:session'; // { token, admin: { _id, name, email } }

export class ApiError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = falha de rede (a requisição nem chegou ao servidor)
    this.extra = extra;
  }
}

export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) ?? null; } catch { return null; }
};
export const setSession = (session) => {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* storage bloqueado: segue sem persistir */ }
};

// Quem cuida da sessão (AuthContext) registra o que fazer quando a API responde 401
// a uma requisição autenticada: token inválido leva ao login.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

// A API roda no plano gratuito do Render: depois de um tempo parada ela "dorme" e a primeira
// requisição leva ~30-50s. Quem quiser (o layout) escuta e mostra um aviso de "acordando o servidor".
const SLOW_MS = 4000;
const slowListeners = new Set();
let pendingSlow = 0;
const emitSlow = () => slowListeners.forEach((fn) => fn(pendingSlow > 0));
export const onSlowRequests = (fn) => { slowListeners.add(fn); return () => slowListeners.delete(fn); };

export async function request(path, { method = 'GET', body, query, signal, auth = true } = {}) {
  const params = query
    ? Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
    : [];
  const qs = params.length ? `?${new URLSearchParams(params)}` : '';

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getSession()?.token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let slow = false;
  const timer = setTimeout(() => { slow = true; pendingSlow += 1; emitSlow(); }, SLOW_MS);

  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method, headers, signal, body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique a internet e tente novamente.');
  } finally {
    clearTimeout(timer);
    if (slow) { pendingSlow -= 1; emitSlow(); }
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth && token && onUnauthorized) onUnauthorized();
    // a API às vezes responde { error } e às vezes { message }
    throw new ApiError(res.status, data?.error ?? data?.message ?? 'Não foi possível concluir a operação.', data ?? {});
  }
  return data;
}

export const errorMessage = (err) => err?.message ?? 'Algo deu errado.';
