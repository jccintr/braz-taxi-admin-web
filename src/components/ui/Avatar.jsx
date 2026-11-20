import { useState } from 'react';
import { initials } from '../../lib/format';

// Foto quando houver (e carregar); senão, iniciais em amarelo-táxi. `online` desenha o pontinho verde.
export default function Avatar({ src, name, size = 'size-10', online, className = '' }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={`relative inline-flex shrink-0 ${size} ${className}`}>
      {src && !broken ? (
        <img src={src} alt="" onError={() => setBroken(true)} className="size-full rounded-full object-cover ring-1 ring-border" />
      ) : (
        <span className="flex size-full items-center justify-center rounded-full bg-primary text-primary-ink [container-type:size]">
          <span className="font-display font-semibold leading-none" style={{ fontSize: '38cqw' }}>{initials(name)}</span>
        </span>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-surface ${online ? 'bg-success' : 'bg-gray-400'}`} title={online ? 'Online' : 'Offline'} />
      )}
    </span>
  );
}
