const TZ = 'America/Sao_Paulo'; // a operação roda no horário de Brasília, onde quer que o admin esteja

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
const dateFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const timeSecFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const monthFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, month: 'short' });
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDateTime = (v) => { const d = toDate(v); return d ? dateTimeFmt.format(d).replace(',', '') : '—'; };
export const formatDate = (v) => { const d = toDate(v); return d ? dateFmt.format(d) : '—'; };
export const formatTime = (v) => { const d = toDate(v); return d ? timeFmt.format(d) : '—'; };
export const formatTimeSec = (v) => { const d = toDate(v); return d ? timeSecFmt.format(d) : '—'; };
export const formatMonth = (v) => { const d = toDate(v); return d ? monthFmt.format(d).replace('.', '') : '—'; };
export const formatMoney = (v) => money.format(Number(v) || 0);

/** "agora", "há 5 min", "há 3 h", "há 2 dias"... */
export function timeAgo(value, now = Date.now()) {
  const d = toDate(value);
  if (!d) return '—';
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 60) return 'agora';
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  const y = Math.floor(days / 365);
  return `há ${y} ${y === 1 ? 'ano' : 'anos'}`;
}

/** intervalo entre duas datas: "42 s", "3 min 10 s", "1 h 05 min" */
export function formatGap(from, to) {
  const a = toDate(from); const b = toDate(to);
  if (!a || !b) return '';
  const s = Math.max(0, Math.round((b - a) / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${s % 60 ? ` ${s % 60} s` : ''}`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
}

/** distância vem em km */
export const formatDistance = (km) => {
  const n = Number(km) || 0;
  return n < 1 ? `${Math.round(n * 1000)} m` : `${n.toFixed(1).replace('.', ',')} km`;
};

/** duração vem em minutos */
export const formatDuration = (min) => {
  const n = Math.round(Number(min) || 0);
  if (n < 60) return `${n} min`;
  return `${Math.floor(n / 60)}h${String(n % 60).padStart(2, '0')}`;
};

/** "35999991234" -> "(35) 99999-1234" */
export function formatPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value ? String(value) : '—';
}
export const whatsappUrl = (phone) => {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}` : null;
};

export const formatRating = (r) => (typeof r === 'number' ? r.toFixed(1).replace('.', ',') : '—');

/** busca sem acento e sem diferenciar maiúsculas */
export const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const initials = (name) =>
  String(name ?? '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
