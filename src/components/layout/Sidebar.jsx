import { NavLink } from 'react-router-dom';
import { NAV } from './nav';
import Logo from '../Logo';
import { useLive } from '../../context/LiveContext';

// Barra lateral sempre escura (identidade "central de táxi"), nos dois temas.
export default function Sidebar({ onNavigate }) {
  const { counts } = useLive();
  const badge = { '/corridas': counts.pending, '/mapa': counts.online };

  return (
    <div className="flex h-full flex-col bg-sidebar text-[#f7f3e8]">
      <div className="h-2 shrink-0 bg-checker" aria-hidden="true" />
      <div className="px-5 py-5">
        <Logo markClassName="size-11" />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Principal">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={item.section} className={`px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8580] ${i ? 'pt-5' : ''}`}>
              {item.section}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#ffcc1a] text-[#0b0b0b]' : 'text-[#c9c5bc] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/corridas' && badge[item.to] > 0 && (
                    <span className={`flex min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums ${isActive ? 'bg-[#0b0b0b] text-[#ffcc1a]' : 'bg-[#ffcc1a] text-[#0b0b0b]'}`} title="Corridas pendentes">
                      {badge[item.to]}
                    </span>
                  )}
                  {item.to === '/mapa' && (
                    <span className={`text-xs tabular-nums ${isActive ? 'text-[#0b0b0b]/70' : 'text-[#8a8580]'}`} title="Motoristas online">{badge[item.to]} on</span>
                  )}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-[#8a8580]">
        Braz Taxi · Brazópolis/MG
      </div>
    </div>
  );
}
