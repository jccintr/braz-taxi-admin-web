import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'flowbite-react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineArrowRight } from 'react-icons/hi';
import { NAV } from './nav';
import { listDrivers, listPassengers } from '../../api/adminApi';
import { normalize } from '../../lib/format';
import Avatar from '../ui/Avatar';

const ACTIONS = [
  { to: '/motoristas/novo', label: 'Cadastrar motorista', icon: HiOutlinePlus, keywords: 'novo motorista cadastrar' },
  { to: '/notificacoes', label: 'Enviar notificação aos motoristas', icon: HiOutlinePlus, keywords: 'push aviso enviar' },
  { to: '/corridas?lista=pendentes', label: 'Ver corridas pendentes', icon: HiOutlineArrowRight, keywords: 'pendentes aguardando' },
];

/**
 * Ctrl+K (ou ⌘K): vai para qualquer tela, motorista ou passageiro digitando o nome.
 * As listas de motoristas e passageiros são carregadas na primeira vez que a paleta abre.
 */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [people, setPeople] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery(''); // eslint-disable-line react-hooks/set-state-in-effect
    setActive(0);
    if (people) return;
    const controller = new AbortController();
    Promise.allSettled([listDrivers(controller.signal), listPassengers(controller.signal)]).then(([d, p]) => {
      if (controller.signal.aborted) return;
      setPeople({
        drivers: d.status === 'fulfilled' ? d.value : [],
        passengers: p.status === 'fulfilled' ? p.value : [],
      });
    });
    return () => controller.abort();
  }, [open, people]);

  const items = useMemo(() => {
    const q = normalize(query.trim());
    const match = (...fields) => !q || fields.some((f) => normalize(f).includes(q));
    const pages = NAV.filter((n) => n.to && match(n.label, n.keywords)).map((n) => ({ group: 'Telas', key: n.to, label: n.label, icon: n.icon, to: n.to }));
    const actions = ACTIONS.filter((a) => match(a.label, a.keywords)).map((a) => ({ group: 'Ações', key: a.to + a.label, label: a.label, icon: a.icon, to: a.to }));
    if (!q) return [...pages, ...actions];
    const drivers = (people?.drivers ?? []).filter((d) => match(d.name)).slice(0, 6)
      .map((d) => ({ group: 'Motoristas', key: d._id, label: d.name, avatar: d, online: d.online, to: `/motoristas/${d._id}` }));
    const passengers = (people?.passengers ?? []).filter((p) => match(p.name, p.email, p.telefone)).slice(0, 6)
      .map((p) => ({ group: 'Passageiros', key: p._id, label: p.name, sub: p.email, avatar: p, to: `/passageiros/${p._id}` }));
    return [...pages, ...actions, ...drivers, ...passengers];
  }, [query, people]);

  const go = (item) => { onClose(); navigate(item.to); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter' && items[active]) { e.preventDefault(); go(items[active]); }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let lastGroup = null;
  return (
    <Modal show={open} onClose={onClose} size="xl" dismissible position="top-center">
      <div className="flex items-center gap-3 border-b border-border px-4">
        <HiOutlineSearch className="h-5 w-5 text-text-soft" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder="Buscar tela, motorista ou passageiro…"
          aria-label="Buscar"
          className="h-14 flex-1 border-0 bg-transparent text-base text-text placeholder:text-text-soft focus:ring-0"
        />
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-text-soft">ESC</kbd>
      </div>
      <ul ref={listRef} className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
        {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-text-soft">{people ? 'Nada encontrado.' : 'Carregando…'}</li>}
        {items.map((item, i) => {
          const header = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;
          return (
            <li key={item.key} role="presentation">
              {header && <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft">{header}</div>}
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                data-index={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === active ? 'bg-primary text-primary-ink' : 'text-text'}`}
              >
                {item.avatar ? <Avatar src={item.avatar.avatar} name={item.label} size="size-7" online={item.online} /> : <item.icon className="h-5 w-5 opacity-80" />}
                <span className="flex-1 truncate">{item.label}</span>
                {item.sub && <span className="truncate text-xs opacity-70">{item.sub}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
