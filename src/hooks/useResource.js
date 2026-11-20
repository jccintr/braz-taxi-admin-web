import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/client';

/**
 * Carrega um recurso da API com cancelamento (troca de filtro/página cancela a requisição anterior).
 * `loader(signal)` deve devolver a Promise da API. `deps` dizem quando recarregar.
 * Devolve { data, error, loading, reload, setData }.
 */
export function useResource(loader, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  useEffect(() => { loaderRef.current = loader; });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    setError('');
    loaderRef.current(controller.signal)
      .then((result) => { setData(result); setLoading(false); })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(errorMessage(err));
        setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}
