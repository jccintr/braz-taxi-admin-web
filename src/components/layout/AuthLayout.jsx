import { Outlet } from 'react-router-dom';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';

// Login: metade "letreiro" (preto + quadriculado de táxi) e metade formulário.
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b0b0b] p-10 text-[#f7f3e8] lg:flex">
        <div className="absolute inset-x-0 top-0 h-5 bg-checker" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-5 bg-checker" aria-hidden="true" />
        <div className="absolute -right-24 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-[#ffcc1a]/10 blur-3xl" aria-hidden="true" />
        <Logo markClassName="size-14" textClassName="text-2xl" />
        <div className="relative">
          <p className="font-display text-5xl font-semibold uppercase leading-tight">
            Toda a operação<br />
            <span className="text-[#ffcc1a]">em uma tela.</span>
          </p>
          <p className="mt-4 max-w-md text-sm text-[#a39e95]">
            Motoristas online, corridas em tempo real, cadastros, mensagens dos passageiros e avisos para a frota.
          </p>
        </div>
        <p className="text-xs text-[#8a8580]">Seu táxi por aplicativo · Brazópolis/MG</p>
      </div>
      <div className="relative flex items-center justify-center px-4 py-10">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center text-text lg:hidden"><Logo markClassName="size-12" /></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
