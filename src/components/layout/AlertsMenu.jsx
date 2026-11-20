import { Dropdown, DropdownHeader, ToggleSwitch } from 'flowbite-react';
import { HiOutlineBell, HiOutlineBellAlert } from 'react-icons/hi2';
import { useLive } from '../../context/LiveContext';

// Preferências do alerta de corrida nova (guardadas neste navegador).
export default function AlertsMenu() {
  const { alerts, setAlerts } = useLive();
  const on = alerts.sound || alerts.desktop;
  const Icon = on ? HiOutlineBellAlert : HiOutlineBell;
  const desktopSupported = typeof window !== 'undefined' && 'Notification' in window;
  return (
    <Dropdown inline arrowIcon={false} placement="bottom-end" dismissOnClick={false} label={<Icon className={`h-5 w-5 ${on ? 'text-accent' : 'text-text-soft hover:text-text'}`} aria-label="Alertas de corrida nova" />}>
      <DropdownHeader>
        <span className="block text-sm font-semibold">Alerta de corrida nova</span>
        <span className="block max-w-56 text-xs text-text-soft">Quando um passageiro pede corrida, o painel sempre mostra um aviso. Você pode somar:</span>
      </DropdownHeader>
      <div className="space-y-3 px-4 py-3">
        <ToggleSwitch checked={alerts.sound} onChange={(v) => setAlerts({ sound: v })} label="Tocar um som" />
        <ToggleSwitch checked={alerts.desktop} disabled={!desktopSupported} onChange={(v) => setAlerts({ desktop: v })} label="Notificação do navegador" />
        <p className="max-w-56 text-[11px] text-text-soft">A notificação aparece mesmo com o painel em outra aba.</p>
      </div>
    </Dropdown>
  );
}
