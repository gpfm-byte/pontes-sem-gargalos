// Hook de consumo da camada de serviço.
// Componentes leem SÓ daqui → trocar mock por ApiPontesService não toca em componente.
import { useState, useEffect } from 'react';

/**
 * Executa uma chamada do pontesService no mount e devolve o resultado.
 * `initial` mantém a UI estável enquanto a Promise resolve (mock ou backend real).
 */
export function usePontesData<T>(fn: () => Promise<T>, initial: T): T {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    let alive = true;
    fn()
      .then(r => { if (alive) setData(r); })
      .catch(err => { console.error('[usePontesData]', err); });
    return () => { alive = false; };
    // Executa uma vez no mount; a factory decide a fonte de dados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}
