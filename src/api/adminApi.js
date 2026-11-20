// Todas as rotas que o painel usa. Nenhuma rota nova: é exatamente o que a API já expõe hoje.
import { request } from './client';

// ---- sessão
export const login = (email, password) =>
  request('/admin/auth/login', { method: 'POST', body: { email, password }, auth: false });

// ---- visão geral
export const getDashboard = (signal) => request('/admin/dashboard', { signal });
export const getMonthlyReport = (month, year, signal) => request('/admin/rides/report', { query: { month, year }, signal });
export const getMapData = (signal) => request('/admin/map', { signal });

// ---- corridas
// cada situação tem a sua rota paginada (10 por página) que devolve { pages, data }
export const RIDE_LISTS = {
  pendentes: '/admin/rides/pending',
  aceitas: '/admin/rides/accepted',
  'em-andamento': '/admin/rides/in-progress',
  concluidas: '/admin/rides',
  'canceladas-motorista': '/admin/rides/cancelled',
  'canceladas-passageiro': '/admin/rides/solicited',
};
export const listRides = (list, page, signal) => request(RIDE_LISTS[list], { query: { page }, signal });
export const getRide = (id, signal) => request(`/admin/rides/${id}`, { signal });
export const deleteRide = (id) => request(`/admin/rides/${id}`, { method: 'DELETE' });

// ---- motoristas
export const listDrivers = (signal) => request('/admin/drivers', { signal });
export const getDriver = (id, signal) => request(`/admin/drivers/${id}`, { signal });
export const getDriverRides = (id, signal) => request(`/admin/drivers/${id}/rides`, { signal });
export const createDriver = (data) => request('/admin/drivers/register', { method: 'POST', body: data });
export const updateDriver = (id, data) => request(`/admin/drivers/${id}`, { method: 'PUT', body: data });
export const toggleDriverOnline = (id) => request(`/admin/drivers/${id}/status`, { method: 'POST' });
export const pushToDriver = (driverId, title, body) =>
  request('/admin/drivers/sendPushMessage', { method: 'POST', body: { driverId, title, body } });
export const pushToAllDrivers = (title, body) =>
  request('/admin/drivers/sendPushMessageToAll', { method: 'POST', body: { title, body } });

// ---- passageiros
export const listPassengers = (signal) => request('/admin/passengers', { signal });
export const getPassenger = (id, signal) => request(`/admin/passengers/${id}`, { signal });
export const getPassengerRides = (id, signal) => request(`/admin/passengers/${id}/rides`, { signal });
export const updatePassenger = (id, data) => request(`/admin/passengers/${id}`, { method: 'PUT', body: data });

// ---- mensagens (fale conosco do app do passageiro)
export const listMessages = (signal) => request('/admin/passengers/messages', { signal });
export const setMessageRead = (id, lida) => request(`/admin/passengers/messages/${id}`, { method: 'PUT', body: { lida } });
export const deleteMessage = (id) => request(`/admin/passengers/messages/${id}`, { method: 'DELETE' });

// ---- logs (paginados, 10 por página: { page, pages, total, data })
export const listLogs = (who, page, signal) => request(`/admin/logs/${who}`, { query: { page }, signal });
export const deleteLog = (who, id) => request(`/admin/logs/${who}/${id}`, { method: 'DELETE' });
