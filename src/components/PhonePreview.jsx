import logo from '../assets/logo.png';

/** Prévia de como a notificação aparece na tela de bloqueio do Android do motorista. */
export default function PhonePreview({ title, body, compact = false }) {
  const now = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).replace(/^./, (c) => c.toUpperCase());
  return (
    <div className="flex justify-center" aria-label="Prévia da notificação">
      <div className={`relative w-full ${compact ? 'max-w-[250px]' : 'max-w-[290px]'} rounded-[2.4rem] border-[10px] border-[#1c1c1c] bg-gradient-to-b from-[#2a2a2a] via-[#141414] to-[#0b0b0b] p-3 shadow-2xl`}>
        <div className="mx-auto mb-6 h-5 w-24 rounded-full bg-black" />
        <div className="text-center text-white">
          <div className="font-display text-5xl font-medium">{now}</div>
          <div className="mt-1 text-xs opacity-70">{date}</div>
        </div>
        <div className={`${compact ? 'mt-8 mb-16' : 'mt-10 mb-24'} rounded-2xl bg-white/90 p-3 text-[#161513] shadow-lg backdrop-blur`}>
          <div className="flex items-center gap-1.5 text-[11px] text-[#57534b]">
            <img src={logo} alt="" className="size-4 object-contain" />
            <span>Braz Taxi Motorista</span>
            <span>· agora</span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold">{title || 'Título da notificação'}</p>
          <p className="line-clamp-4 whitespace-pre-wrap break-words text-[13px] text-[#3a3732]">{body || 'O texto da mensagem aparece aqui.'}</p>
        </div>
        <div className="mx-auto h-1 w-24 rounded-full bg-white/40" />
      </div>
    </div>
  );
}
