import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextInput } from 'flowbite-react';
import { HiOutlineSearch, HiOutlineUserGroup } from 'react-icons/hi';
import { listPassengers } from '../../api/adminApi';
import { useResource } from '../../hooks/useResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Stars from '../../components/ui/Stars';
import Pagination from '../../components/ui/Pagination';
import { ErrorState, Loading, Empty } from '../../components/ui/States';
import { formatPhone, normalize } from '../../lib/format';

const PAGE = 20;

export default function PassageirosPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const dq = useDebouncedValue(q, 200);
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource((signal) => listPassengers(signal), []);

  const list = useMemo(() => {
    const nq = normalize(dq.trim());
    const digits = dq.replace(/\D/g, '');
    return (data ?? []).filter((p) => !nq || normalize(p.name).includes(nq) || normalize(p.email).includes(nq) || (digits.length >= 3 && String(p.telefone ?? '').replace(/\D/g, '').includes(digits)));
  }, [data, dq]);
  const pages = Math.ceil(list.length / PAGE);
  const current = Math.min(page, Math.max(1, pages));
  const slice = list.slice((current - 1) * PAGE, current * PAGE);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Passageiros" subtitle="Quem usa o app do passageiro. Busque por nome, email ou telefone." />
      <div className="mb-4">
        <TextInput type="search" icon={HiOutlineSearch} placeholder="Buscar nome, email ou telefone" aria-label="Buscar passageiros" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : slice.length === 0 ? (
        <Empty icon={HiOutlineUserGroup}>{q ? 'Ninguém encontrado com essa busca.' : 'Nenhum passageiro cadastrado.'}</Empty>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-alt text-xs uppercase tracking-wide text-text-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Passageiro</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {slice.map((p) => (
                  <tr key={p._id} onClick={() => navigate(`/passageiros/${p._id}`)} className="cursor-pointer text-text hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={p.avatar} name={p.name} size="size-9" />
                        <div className="min-w-0">
                          <Link to={`/passageiros/${p._id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-semibold hover:text-accent">{p.name}</Link>
                          <span className="block truncate text-xs text-text-soft">{p.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-soft">{formatPhone(p.telefone)}</td>
                    <td className="px-4 py-3"><Stars value={p.rating} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2 md:hidden">
            {slice.map((p) => (
              <li key={p._id}>
                <Link to={`/passageiros/${p._id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:bg-surface-alt">
                  <Avatar src={p.avatar} name={p.name} size="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">{p.name}</p>
                    <p className="truncate text-xs text-text-soft">{formatPhone(p.telefone)}</p>
                  </div>
                  <Stars value={p.rating} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {data && <Pagination page={current} pages={pages} onChange={setPage} total={list.length} noun={list.length === 1 ? 'passageiro' : 'passageiros'} />}
    </div>
  );
}
