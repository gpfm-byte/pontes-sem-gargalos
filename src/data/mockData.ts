import type {
  Ponte, LeituraSensor, PrevisaoIA, Alerta, LogAuditoria,
  StatusPonteUI, PontoFluxo, DadoEficiencia,
} from './types';

// ─── Pontes do Bairro do Recife ───────────────────────────────────────────────

export const PONTES: Ponte[] = [
  {
    id: 'buarque-de-macedo',
    nome: 'Buarque de Macedo',
    nomeCompleto: 'Ponte Buarque de Macedo',
    capacidadeVeiculos: 800,
    coordenadas: { lat: -8.0598, lng: -34.8741 },
  },
  {
    id: 'mauricio-nassau',
    nome: 'Maurício de Nassau',
    nomeCompleto: 'Ponte Maurício de Nassau',
    capacidadeVeiculos: 1000,
    coordenadas: { lat: -8.0635, lng: -34.8719 },
  },
  {
    id: 'giratoria',
    nome: 'Giratória',
    nomeCompleto: 'Ponte Giratória (Ponte Velha)',
    capacidadeVeiculos: 600,
    coordenadas: { lat: -8.0660, lng: -34.8735 },
  },
];

// ─── Gerador de padrão de tráfego realista (rush hour Recife) ─────────────────
// Picos: 7h–9h (entrada) e 17h–19h (saída). Vale: 13h–14h.

function curvaTrafegoHora(hora: number): number {
  // Curva bimodal: manhã e tarde
  const manha = Math.exp(-0.5 * Math.pow((hora - 8) / 1.2, 2));
  const tarde  = Math.exp(-0.5 * Math.pow((hora - 18) / 1.0, 2));
  const base   = 0.15; // tráfego mínimo noturno
  return base + 0.85 * Math.max(manha, tarde);
}

function jitter(valor: number, pct = 0.08): number {
  return Math.round(valor * (1 + (Math.random() - 0.5) * 2 * pct));
}

// ─── Fluxo por hora (Dashboard) ──────────────────────────────────────────────

export function gerarFluxoPorHora(capacidade = 1200): PontoFluxo[] {
  const horas = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  return horas.map(h => ({
    hora: `${String(h).padStart(2, '0')}:00`,
    veiculos: jitter(Math.round(curvaTrafegoHora(h) * capacidade)),
  }));
}

// ─── Leituras atuais das pontes ───────────────────────────────────────────────

export function gerarLeituraAtual(ponte: Ponte, hora = new Date()): LeituraSensor {
  const fator = curvaTrafegoHora(hora.getHours());
  const veiculos = jitter(Math.round(fator * ponte.capacidadeVeiculos));
  const ocupacao = Math.min(100, Math.round((veiculos / ponte.capacidadeVeiculos) * 100));
  const velocidade = ocupacao > 85 ? jitter(15, 0.2)
    : ocupacao > 65 ? jitter(30, 0.15)
    : jitter(50, 0.1);
  const travessia = Math.round(60 / Math.max(velocidade, 5) * 0.8); // ~800m

  return {
    ponteId: ponte.id,
    timestamp: hora,
    veiculosPorHora: veiculos,
    ocupacaoPct: ocupacao,
    velocidadeMedia: velocidade,
    tempoDeTravessia: travessia,
  };
}

// ─── Status agregado para UI ──────────────────────────────────────────────────

export function gerarStatusPontes(): StatusPonteUI[] {
  return PONTES.map(ponte => {
    const leitura = gerarLeituraAtual(ponte);
    const status = leitura.ocupacaoPct >= 90 ? 'congestionado'
      : leitura.ocupacaoPct >= 70 ? 'atencao'
      : 'normal';
    const cor = status === 'congestionado' ? 'red'
      : status === 'atencao' ? 'orange'
      : 'green';
    return { ponte, leituraAtual: leitura, status, cor };
  });
}

// ─── Previsão IA (próximas 2h em intervalos de 15min) ────────────────────────

export function gerarPrevisao(ponteId: string): PrevisaoIA {
  const agora = new Date();
  const capacidade = PONTES.find(p => p.id === ponteId)?.capacidadeVeiculos ?? 1000;
  const pontos = Array.from({ length: 8 }, (_, i) => {
    const ts = new Date(agora.getTime() + (i + 1) * 15 * 60 * 1000);
    const fator = curvaTrafegoHora(ts.getHours() + ts.getMinutes() / 60);
    return {
      timestamp: ts,
      veiculosPrevisto: jitter(Math.round(fator * capacidade), 0.05),
      confianca: parseFloat((0.96 - i * 0.015).toFixed(3)),
    };
  });

  return {
    ponteId,
    geradaEm: agora,
    horizonte: '2h',
    pontos,
    modeloVersao: 'lstm-transformer-v1.2',
  };
}

// ─── Dados de eficiência semanal (AnaliseIA) ──────────────────────────────────

export const EFICIENCIA_SEMANAL: DadoEficiencia[] = [
  { dia: 'Seg', antesMin: 45, depoisMin: 28 },
  { dia: 'Ter', antesMin: 52, depoisMin: 31 },
  { dia: 'Qua', antesMin: 48, depoisMin: 27 },
  { dia: 'Qui', antesMin: 55, depoisMin: 33 },
  { dia: 'Sex', antesMin: 61, depoisMin: 35 },
  { dia: 'Sab', antesMin: 38, depoisMin: 22 },
  { dia: 'Dom', antesMin: 32, depoisMin: 19 },
];

// ─── Alertas mock ─────────────────────────────────────────────────────────────

export const ALERTAS_ATIVOS: Alerta[] = [
  {
    id: 'alerta-001',
    ponteId: 'mauricio-nassau',
    tipo: 'congestionamento',
    nivel: 'alto',
    mensagem: 'Fila na Ponte Maurício de Nassau (sentido Bairro do Recife). Ocupação elevada.',
    criadoEm: new Date(Date.now() - 8 * 60 * 1000),
    resolvidoEm: null,
    geradoPorIA: false,
  },
  {
    id: 'alerta-002',
    ponteId: 'giratoria',
    tipo: 'congestionamento',
    nivel: 'medio',
    mensagem: 'Tráfego acima do normal na Ponte Giratória. Sensor Av. Marquês de Olinda.',
    criadoEm: new Date(Date.now() - 15 * 60 * 1000),
    resolvidoEm: null,
    geradoPorIA: false,
  },
  {
    id: 'alerta-003',
    ponteId: 'buarque-de-macedo',
    tipo: 'evento',
    nivel: 'baixo',
    mensagem: 'Evento cultural no Bairro do Recife. Fluxo elevado possível na Buarque de Macedo.',
    criadoEm: new Date(Date.now() - 45 * 60 * 1000),
    resolvidoEm: null,
    geradoPorIA: false,
  },
];

// ─── Log de auditoria (US-15) ─────────────────────────────────────────────────
// Simulação de cadeia SHA-256 (em produção: hash real do registro anterior)

export const LOG_AUDITORIA: LogAuditoria[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    acao: 'Ajuste de semáforo',
    decisaoIA: 'Aumentar ciclo verde em 15s na Duarte Coelho sentido norte',
    decisaoHumana: 'Aprovado pelo operador CTTU #42',
    concordancia: true,
    hash: 'a3f7c912b2e1d4f8a9c0e3b5d7f1a2c4',
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    acao: 'Rota alternativa',
    decisaoIA: 'Sugerir desvio pela Av. Agamenon Magalhães para veículos pesados',
    decisaoHumana: null, // ação autônoma dentro do escopo aprovado
    concordancia: true,
    hash: 'e8b3d6f9c1a4e7b2d5f8a1c3e6b9d2f5',
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 28 * 60 * 1000),
    acao: 'Bloqueio preventivo',
    decisaoIA: 'Bloquear Ponte Princesa Isabel por risco de alagamento (chuva prevista)',
    decisaoHumana: 'Negado pelo gestor — sem confirmação meteorológica oficial',
    concordancia: false,
    hash: 'b1c4e7a2d5f8b3c6e9a2d5f8b1c4e7a2',
  },
];
