import { createTheme } from 'flowbite-react';

// Ajustes nos componentes do flowbite-react para o amarelo-táxi: o padrão deles é texto branco
// sobre o primary-700; aqui o botão principal é amarelo com texto preto (como no app e no logo).
export const flowbiteTheme = createTheme({
  button: {
    color: {
      default:
        'bg-primary-400 font-semibold text-gray-900 hover:bg-primary-300 focus:ring-primary-200 dark:bg-primary-400 dark:text-gray-900 dark:hover:bg-primary-300 dark:focus:ring-primary-800',
    },
  },
  toggleSwitch: {
    toggle: { checked: { color: { default: 'bg-primary-500 group-focus:ring-primary-200 dark:group-focus:ring-primary-800' } } },
  },
});
