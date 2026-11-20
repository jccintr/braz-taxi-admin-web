import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Drawer, Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from 'flowbite-react';
import { HiOutlineMenuAlt2, HiOutlineSearch, HiOutlineLogout } from 'react-icons/hi';
import Sidebar from './Sidebar';
import LiveStrip from './LiveStrip';
import AlertsMenu from './AlertsMenu';
import CommandPalette from './CommandPalette';
import ThemeToggle from '../ThemeToggle';
import Avatar from '../ui/Avatar';
import { Loading } from '../ui/States';
import { useAuth } from '../../context/AuthContext';
import { LiveProvider } from '../../context/LiveContext';
import { onSlowRequests } from '../../api/client';

function SlowServerBanner() {
  const [slow, setSlow] = useState(false);
  useEffect(() => onSlowRequests(setSlow), []);
  if (!slow) return null;
  return (
    <div className="relative overflow-hidden border-b border-border bg-surface-alt px-4 py-2 text-center text-xs text-text-soft" role="status">
      <div className="absolute inset-x-0 bottom-0 h-0.5 animate-road" style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-primary) 0 20px, transparent 20px 40px)' }} aria-hidden="true" />
      Acordando o servidor… a API no Render dorme quando fica parada, a primeira resposta pode levar até 1 minuto.
    </div>
  );
}

export default function AppLayout() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => { signOut(); navigate('/login', { replace: true }); };
  const fullBleed = location.pathname === '/mapa'; // o mapa ocupa a área toda

  return (
    <LiveProvider>
      <div className="flex min-h-screen bg-background">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <Sidebar />
        </aside>
        <Drawer open={drawer} onClose={() => setDrawer(false)} className="w-64 p-0 lg:hidden">
          <Sidebar onNavigate={() => setDrawer(false)} />
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
              <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-2 text-text-soft hover:bg-surface-alt lg:hidden" aria-label="Abrir menu">
                <HiOutlineMenuAlt2 className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setPalette(true)}
                className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface-alt px-3 text-sm text-text-soft transition-colors hover:border-primary-400 sm:max-w-xs"
              >
                <HiOutlineSearch className="h-4 w-4 shrink-0" />
                <span className="truncate">Buscar…</span>
                <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
              </button>
              <div className="flex-1" />
              <LiveStrip />
              <AlertsMenu />
              <ThemeToggle />
              <Dropdown inline arrowIcon={false} placement="bottom-end" label={<Avatar name={admin?.name} size="size-9" />}>
                <DropdownHeader>
                  <span className="block text-sm font-semibold">{admin?.name ?? 'Administrador'}</span>
                  <span className="block truncate text-xs text-text-soft">{admin?.email}</span>
                </DropdownHeader>
                <DropdownDivider />
                <DropdownItem icon={HiOutlineLogout} onClick={handleLogout}>Sair</DropdownItem>
              </Dropdown>
            </div>
            <SlowServerBanner />
          </header>

          <main className={fullBleed ? 'flex flex-1 flex-col' : 'mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8'}>
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </LiveProvider>
  );
}
