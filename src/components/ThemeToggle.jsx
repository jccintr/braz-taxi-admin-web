import { Dropdown, DropdownItem } from 'flowbite-react';
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from 'react-icons/hi2';
import { useAppTheme } from '../context/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: HiOutlineSun },
  { value: 'dark', label: 'Escuro', icon: HiOutlineMoon },
  { value: 'system', label: 'Sistema', icon: HiOutlineComputerDesktop },
];

export default function ThemeToggle({ className = 'text-text-soft hover:text-text' }) {
  const { preference, setThemePreference } = useAppTheme();
  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[2];
  const CurrentIcon = current.icon;
  return (
    <Dropdown inline arrowIcon={false} placement="bottom-end" label={<CurrentIcon className={`h-5 w-5 ${className}`} aria-label={`Tema: ${current.label}`} />}>
      {OPTIONS.map((o) => (
        <DropdownItem key={o.value} icon={o.icon} onClick={() => setThemePreference(o.value)} className={o.value === preference ? 'font-semibold text-accent' : undefined}>
          {o.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
