// Camada de serviço — troca mock por CTTU sem tocar nos componentes.
// Para ativar dados reais: defina VITE_DATA_SOURCE=cttu no .env

import type {
  StatusPonteUI, PontoFluxo, PrevisaoIA, Alerta, DadoEficiencia,
  LeituraSensor, StatusPonte, NivelAlerta, Ponte, LogAuditoria,
} from '../data/types';

// ─── Contrato ─────────────────────────────────────────────────────────────────

export interface IPontesService {
  getPontes(): Promise<Ponte[]>;
  getStatusPontes(): Promise<StatusPonteUI[]>;
  getFluxoPorHora(ponteId?: string): Promise<PontoFluxo[]>;
  getPrevisao(ponteId: string): Promise<PrevisaoIA>;
  getAlertasAtivos(): Promise<Alerta[]>;
  getEficienciaSemanal(): Promise<DadoEficiencia[]>;
  getLogAuditoria(): Promise<LogAuditoria[]>;
}

// ─── Implementação Mock ───────────────────────────────────────────────────────

class MockPontesService implements IPontesService {
  async getPontes() {
    const { PONTES } = await import('../data/mockData');
    return PONTES;
  }

  async getStatusPontes() {
    const { gerarStatusPontes } = await import('../data/mockData');
    return gerarStatusPontes();
  }

  async getFluxoPorHora(ponteId?: string) {
    const { gerarFluxoPorHora, PONTES } = await import('../data/mockData');
    const capacidade = ponteId
      ? PONTES.find(p => p.id === ponteId)?.capacidadeVeiculos ?? 1200
      : 1200;
    return gerarFluxoPorHora(capacidade);
  }

  async getPrevisao(ponteId: string) {
    const { gerarPrevisao } = await import('../data/mockData');
    return gerarPrevisao(ponteId);
  }

  async getAlertasAtivos() {
    const { ALERTAS_ATIVOS } = await import('../data/mockData');
    return ALERTAS_ATIVOS.filter(a => a.resolvidoEm === null);
  }

  async getEficienciaSemanal() {
    const { EFICIENCIA_SEMANAL } = await import('../data/mockData');
    return EFICIENCIA_SEMANAL;
  }

  async getLogAuditoria() {
    const { LOG_AUDITORIA } = await import('../data/mockData');
    return LOG_AUDITORIA;
  }
}

// ─── Implementação CTTU — Dados Abertos Recife (ODbL) ────────────────────────
// Fonte: dados.recife.pe.gov.br — Velocidade das Vias 2016-2018
// Sensores — ambos dentro do Bairro do Recife:
//   FS002REC — Rua Madre de Deus, semáforo 020 (acesso Buarque de Macedo + Nassau)
//   FS003REC — Av. Marquês de Olinda, semáforo 020 / Cais do Apolo (acesso Giratória)
// getPrevisao + getEficienciaSemanal: removidos do produto (pivô 04/06/2026)

type CtkuRecord = Record<string, string>;

class CTTUPontesService implements IPontesService {
  // Proxy vite.config.ts: /api/cttu → dados.recife.pe.gov.br (evita CORS)
  private readonly DATASTORE = '/api/cttu/api/3/action/datastore_search';
  private readonly RESOURCE   = '3e67a327-db30-4d4c-bd44-928e26e33c3f';
  private readonly DATA_FLUXO  = '2018-08-28';
  private readonly DATA_STATUS = '2018-08-31';

  // Sensor por ponte + capacidade de referência (calibração sensor-específica)
  private readonly SENSOR_MAP: Record<string, { eq: string; capRef: number }> = {
    'buarque-de-macedo': { eq: 'FS002REC', capRef: 900 },
    'mauricio-nassau':   { eq: 'FS002REC', capRef: 900 },
    'giratoria':         { eq: 'FS003REC', capRef: 180 },
  };

  private readonly CAPACIDADES: Record<string, number> = {
    'buarque-de-macedo': 800,
    'mauricio-nassau':   1000,
    'giratoria':         600,
  };

  private readonly BUCKETS: [string, number][] = [
    ['qtd_0a10km', 5], ['qtd_11a20km', 15.5], ['qtd_21a30km', 25.5],
    ['qtd_31a40km', 35.5], ['qtd_41a50km', 45.5], ['qtd_51a60km', 55.5],
    ['qtd_61a70km', 65.5], ['qtd_71a80km', 75.5], ['qtd_81a90km', 85.5],
    ['qtd_91a100km', 95.5], ['qtd_acimade100km', 110],
  ];

  private _cache = new Map<string, { records: CtkuRecord[]; ts: number }>();

  // Registro de pontes — virá do PostGIS/pontes quando o silo abrir
  async getPontes(): Promise<Ponte[]> {
    const { PONTES } = await import('../data/mockData');
    return PONTES;
  }

  private async query(equipamento: string, data: string): Promise<CtkuRecord[]> {
    const key = `${equipamento}|${data}`;
    const hit = this._cache.get(key);
    if (hit && Date.now() - hit.ts < 300_000) return hit.records;

    const params = new URLSearchParams({
      resource_id: this.RESOURCE,
      filters: JSON.stringify({ equipamento, data }),
      limit: '500',
    });
    const resp = await fetch(`${this.DATASTORE}?${params}`);
    if (!resp.ok) throw new Error(`CTTU DataStore ${resp.status}`);
    const json = await resp.json() as { result?: { records: CtkuRecord[] } };
    const records = json.result?.records ?? [];
    this._cache.set(key, { records, ts: Date.now() });
    return records;
  }

  private totalCount(rec: CtkuRecord): number {
    return this.BUCKETS.reduce((s, [f]) => s + Number(rec[f] ?? 0), 0);
  }

  private avgSpeed(rec: CtkuRecord): number {
    let total = 0, soma = 0;
    for (const [f, mid] of this.BUCKETS) {
      const n = Number(rec[f] ?? 0);
      total += n; soma += n * mid;
    }
    return total > 0 ? soma / total : 0;
  }

  // Soma de todos os intervalos e faixas por hora → total horário real
  private aggregate(records: CtkuRecord[]): Map<number, { veiculos: number; velocidade: number }> {
    const acc = new Map<number, { cnt: number; velPeso: number }>();
    for (const rec of records) {
      const h = Number(rec.hora);
      if (!acc.has(h)) acc.set(h, { cnt: 0, velPeso: 0 });
      const a = acc.get(h)!;
      const n = this.totalCount(rec);
      a.cnt += n;
      a.velPeso += this.avgSpeed(rec) * n;
    }
    const out = new Map<number, { veiculos: number; velocidade: number }>();
    for (const [h, a] of acc) {
      out.set(h, {
        veiculos: a.cnt,
        velocidade: a.cnt > 0 ? a.velPeso / a.cnt : 20,
      });
    }
    return out;
  }

  private closestHour(byHora: Map<number, unknown>, target: number): number {
    const hours = Array.from(byHora.keys());
    return hours.reduce((p, c) =>
      Math.abs(c - target) < Math.abs(p - target) ? c : p, hours[0] ?? 8);
  }

  async getFluxoPorHora(ponteId?: string): Promise<PontoFluxo[]> {
    const sensor = ponteId ? this.SENSOR_MAP[ponteId] : this.SENSOR_MAP['mauricio-nassau'];
    if (!sensor) {
      const { gerarFluxoPorHora } = await import('../data/mockData');
      return gerarFluxoPorHora(1000);
    }

    const records = await this.query(sensor.eq, this.DATA_FLUXO);
    if (records.length === 0) {
      const { gerarFluxoPorHora, PONTES } = await import('../data/mockData');
      const cap = ponteId ? (PONTES.find(p => p.id === ponteId)?.capacidadeVeiculos ?? 1000) : 1000;
      return gerarFluxoPorHora(cap);
    }

    const byHora = this.aggregate(records);
    const cap = ponteId ? (this.CAPACIDADES[ponteId] ?? sensor.capRef) : sensor.capRef;
    const fator = cap / sensor.capRef;

    const horas = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
    return horas.map(h => ({
      hora: `${String(h).padStart(2,'0')}:00`,
      veiculos: Math.round((byHora.get(h)?.veiculos ?? 0) * fator),
    }));
  }

  async getStatusPontes(): Promise<StatusPonteUI[]> {
    const { PONTES } = await import('../data/mockData');
    const currentHour = new Date().getHours();

    // Busca dados dos 2 sensores em paralelo
    const [recs002, recs003] = await Promise.all([
      this.query('FS002REC', this.DATA_STATUS).catch(() => [] as CtkuRecord[]),
      this.query('FS003REC', this.DATA_STATUS).catch(() => [] as CtkuRecord[]),
    ]);

    const byHora002 = this.aggregate(recs002);
    const byHora003 = this.aggregate(recs003);

    const h002 = this.closestHour(byHora002, currentHour);
    const h003 = this.closestHour(byHora003, currentHour);

    return PONTES.map(ponte => {
      const sensor = this.SENSOR_MAP[ponte.id];
      if (!sensor) return null;

      const byHora = sensor.eq === 'FS002REC' ? byHora002 : byHora003;
      const h      = sensor.eq === 'FS002REC' ? h002 : h003;
      const base   = byHora.get(h) ?? { veiculos: sensor.capRef * 0.5, velocidade: 20 };

      const cap  = this.CAPACIDADES[ponte.id];
      const vph  = Math.min(Math.round(base.veiculos * (cap / sensor.capRef)), cap);
      const occ  = Math.min(100, Math.round((vph / cap) * 100));
      const vel  = Math.max(5, Math.round(base.velocidade * (occ < 70 ? 1.0 : 0.65)));
      const trav = Math.round((0.8 / Math.max(vel, 5)) * 60);

      const leituraAtual: LeituraSensor = {
        ponteId: ponte.id, timestamp: new Date(),
        veiculosPorHora: vph, ocupacaoPct: occ,
        velocidadeMedia: vel, tempoDeTravessia: trav,
      };

      const status: StatusPonte = occ >= 90 ? 'bloqueado'
        : occ >= 75 ? 'congestionado'
        : occ >= 50 ? 'atencao'
        : 'normal';

      const cor: 'green' | 'orange' | 'red' = status === 'normal' ? 'green'
        : status === 'atencao' ? 'orange' : 'red';

      return { ponte, leituraAtual, status, cor };
    }).filter(Boolean) as StatusPonteUI[];
  }

  async getAlertasAtivos(): Promise<Alerta[]> {
    const statuses = await this.getStatusPontes();
    return statuses
      .filter(s => s.status === 'congestionado' || s.status === 'bloqueado')
      .map(s => {
        const sensor = this.SENSOR_MAP[s.ponte.id];
        return {
          id: `cttu-${s.ponte.id}`,
          ponteId: s.ponte.id,
          tipo: 'congestionamento' as const,
          nivel: (s.status === 'bloqueado' ? 'critico' : 'alto') as NivelAlerta,
          mensagem: `${s.ponte.nome}: ${s.leituraAtual.ocupacaoPct}% ocupação — sensor ${sensor?.eq ?? 'CTTU'} (threshold)`,
          criadoEm: new Date(),
          resolvidoEm: null,
          geradoPorIA: false,
        };
      });
  }

  async getPrevisao(ponteId: string): Promise<PrevisaoIA> {
    const { gerarPrevisao } = await import('../data/mockData');
    return gerarPrevisao(ponteId);
  }

  async getEficienciaSemanal(): Promise<DadoEficiencia[]> {
    const { EFICIENCIA_SEMANAL } = await import('../data/mockData');
    return EFICIENCIA_SEMANAL;
  }

  // Log de auditoria US-15 — virá da cadeia SHA-256 em log_auditoria (Camada 3)
  async getLogAuditoria(): Promise<LogAuditoria[]> {
    const { LOG_AUDITORIA } = await import('../data/mockData');
    return LOG_AUDITORIA;
  }
}

// ─── Implementação API — back-end próprio (FastAPI + PostgreSQL/TimescaleDB) ──
// O back-end (pasta backend/) serve o mesmo contrato a partir do banco alimentado
// com o dado da CTTU. Ative com VITE_DATA_SOURCE=api e VITE_API_URL no .env.
// getPrevisao/getEficiencia/getLogAuditoria seguem mock (fora do produto pós-pivô).

class ApiPontesService implements IPontesService {
  private readonly base =
    (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '');

  private async get<T>(path: string): Promise<T> {
    const resp = await fetch(`${this.base}${path}`);
    if (!resp.ok) throw new Error(`API ${resp.status} em ${path}`);
    return resp.json() as Promise<T>;
  }

  async getPontes(): Promise<Ponte[]> {
    return this.get<Ponte[]>('/pontes');
  }

  async getStatusPontes(): Promise<StatusPonteUI[]> {
    const data = await this.get<StatusPonteUI[]>('/status');
    // Revive timestamp (JSON traz string ISO; o front espera Date)
    return data.map(s => ({
      ...s,
      leituraAtual: { ...s.leituraAtual, timestamp: new Date(s.leituraAtual.timestamp) },
    }));
  }

  async getFluxoPorHora(ponteId?: string): Promise<PontoFluxo[]> {
    const q = ponteId ? `?ponteId=${encodeURIComponent(ponteId)}` : '';
    return this.get<PontoFluxo[]>(`/fluxo${q}`);
  }

  async getAlertasAtivos(): Promise<Alerta[]> {
    const data = await this.get<Alerta[]>('/alertas');
    return data.map(a => ({
      ...a,
      criadoEm: new Date(a.criadoEm),
      resolvidoEm: a.resolvidoEm ? new Date(a.resolvidoEm) : null,
    }));
  }

  async getPrevisao(ponteId: string): Promise<PrevisaoIA> {
    const { gerarPrevisao } = await import('../data/mockData');
    return gerarPrevisao(ponteId);
  }

  async getEficienciaSemanal(): Promise<DadoEficiencia[]> {
    const { EFICIENCIA_SEMANAL } = await import('../data/mockData');
    return EFICIENCIA_SEMANAL;
  }

  async getLogAuditoria(): Promise<LogAuditoria[]> {
    const { LOG_AUDITORIA } = await import('../data/mockData');
    return LOG_AUDITORIA;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
// mock (padrão) · cttu (proxy direto do dado aberto) · api (back-end próprio)

const dataSource = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

export const pontesService: IPontesService =
  dataSource === 'api'  ? new ApiPontesService()
  : dataSource === 'cttu' ? new CTTUPontesService()
  : new MockPontesService();
