// Hook de consumo da camada de serviço.
// Componentes leem SÓ daqui → trocar mock por ApiPontesService não toca em componente.
import { useState, useEffect } from 'react';

/**
 * Executa uma chamada do pontesService no mount e devolve o resultado.
 * `initial` mantém a UI estável enquanto a Promise resolve (mock ou backend real).
 * `intervalMs` (opcional) liga o polling — refaz a chamada periodicamente, para
 * refletir o feed ao vivo (ex.: simulador de tempo real da CTTU).
 */
export function usePontesData<T>(fn: () => Promise<T>, initial: T, intervalMs?: number): T {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    let alive = true;
    const run = () =>
      fn()
        .then(r => { if (alive) setData(r); })
        .catch(err => { console.error('[usePontesData]', err); });

    run();
    const id = intervalMs && intervalMs > 0 ? setInterval(run, intervalMs) : undefined;
    return () => { alive = false; if (id) clearInterval(id); };
    // A factory decide a fonte de dados; só o intervalo reconfigura o efeito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return data;
}
