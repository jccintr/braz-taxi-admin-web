import logo from '../assets/logo.png';

/** Selo do Braz Taxi + nome. `tag` mostra o selo "central" ao lado. */
export default function Logo({ className = '', markClassName = 'size-10', tag = true, textClassName = 'text-xl' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={logo} alt="" className={`${markClassName} object-contain`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-bold uppercase tracking-wide ${textClassName}`}>Braz Taxi</span>
        {tag && <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">Central de operação</span>}
      </span>
    </span>
  );
}
