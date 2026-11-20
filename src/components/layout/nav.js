import { HiOutlineChartPie, HiOutlineMap, HiOutlineTruck, HiOutlineUserGroup, HiOutlineIdentification, HiOutlineInbox, HiOutlineClipboardList, HiOutlineSpeakerphone } from 'react-icons/hi';

// Itens do menu lateral e da paleta de comandos (Ctrl+K)
export const NAV = [
  { section: 'Operação' },
  { to: '/dashboard', label: 'Painel', icon: HiOutlineChartPie, keywords: 'dashboard inicio relatorio faturamento' },
  { to: '/mapa', label: 'Mapa ao vivo', icon: HiOutlineMap, keywords: 'mapa online motoristas posicao' },
  { to: '/corridas', label: 'Corridas', icon: HiOutlineTruck, keywords: 'corridas viagens pendentes concluidas canceladas' },
  { section: 'Cadastros' },
  { to: '/motoristas', label: 'Motoristas', icon: HiOutlineIdentification, keywords: 'motoristas taxistas drivers' },
  { to: '/passageiros', label: 'Passageiros', icon: HiOutlineUserGroup, keywords: 'passageiros clientes' },
  { section: 'Comunicação' },
  { to: '/mensagens', label: 'Mensagens', icon: HiOutlineInbox, keywords: 'mensagens fale conosco sugestoes reclamacoes' },
  { to: '/notificacoes', label: 'Notificações', icon: HiOutlineSpeakerphone, keywords: 'push notificacao aviso motoristas' },
  { to: '/logs', label: 'Logs', icon: HiOutlineClipboardList, keywords: 'logs auditoria atividade' },
];
