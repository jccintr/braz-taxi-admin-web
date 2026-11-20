// Situações das corridas (campo `status` do model Ride na API)
export const RIDE_STATUS = {
  0: { label: 'Aguardando motorista', short: 'Pendente', tone: 'warning' },
  1: { label: 'Aceita', short: 'Aceita', tone: 'info' },
  2: { label: 'Motorista a caminho', short: 'A caminho', tone: 'info' },
  3: { label: 'Motorista chegou', short: 'No local', tone: 'info' },
  4: { label: 'Em andamento', short: 'Em andamento', tone: 'primary' },
  5: { label: 'Concluída', short: 'Concluída', tone: 'success' },
  [-1]: { label: 'Cancelada pelo passageiro', short: 'Canc. passageiro', tone: 'neutral' },
  [-2]: { label: 'Cancelada pelo motorista', short: 'Canc. motorista', tone: 'danger' },
};
export const rideStatus = (s) => RIDE_STATUS[s] ?? { label: 'Desconhecida', short: '?', tone: 'neutral' };

// Abas da tela de corridas, na ordem do fluxo de uma corrida. A lista "concluídas" é a padrão.
export const RIDE_TABS = [
  { key: 'pendentes', label: 'Pendentes', hint: 'Esperando um motorista aceitar' },
  { key: 'aceitas', label: 'Aceitas', hint: 'Motorista indo buscar ou já no local' },
  { key: 'em-andamento', label: 'Em andamento', hint: 'Passageiro a bordo' },
  { key: 'concluidas', label: 'Concluídas', hint: 'Finalizadas' },
  { key: 'canceladas-motorista', label: 'Canc. motorista', hint: 'Canceladas pelo motorista depois de aceitar' },
  { key: 'canceladas-passageiro', label: 'Canc. passageiro', hint: 'Canceladas pelo passageiro (em geral, não atendidas)' },
];

/** estatísticas de um histórico de corridas (motorista ou passageiro) */
export function rideStats(rides = []) {
  const done = rides.filter((r) => r.status === 5);
  const cancelled = rides.filter((r) => r.status < 0);
  const total = done.reduce((s, r) => s + (r.valor || 0), 0);
  // últimos 6 meses (inclui o atual), em ordem cronológica
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, date: d, count: 0, value: 0 };
  });
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
  for (const r of done) {
    const d = new Date(r.data);
    const m = byKey[`${d.getFullYear()}-${d.getMonth()}`];
    if (m) { m.count += 1; m.value += r.valor || 0; }
  }
  return {
    count: rides.length,
    done: done.length,
    cancelled: cancelled.length,
    total,
    ticket: done.length ? total / done.length : 0,
    cancelRate: rides.length ? cancelled.length / rides.length : 0,
    last: rides[0]?.data ?? null,
    months,
  };
}
