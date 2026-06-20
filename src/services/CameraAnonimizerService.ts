import type { EventoCameraRaw, EventoCameraAgregado, RelatorioCameraLGPD, TipoModal } from '../data/types';

const K_MINIMO = 5;
const JANELA_MINUTOS = 5;

interface JanelaCamera {
  chave: string;
  ponteId: string;
  inicio: Date;
  fim: Date;
  eventos: EventoCameraRaw[];
}

function arredondarJanela(timestamp: Date, minutos: number): Date {
  const ms = minutos * 60 * 1000;
  return new Date(Math.floor(timestamp.getTime() / ms) * ms);
}

function agruparEmJanelas(eventos: EventoCameraRaw[], minutos: number): JanelaCamera[] {
  const duracaoMs = minutos * 60 * 1000;
  const mapa = new Map<string, JanelaCamera>();

  for (const ev of eventos) {
    const inicio = arredondarJanela(ev.timestamp, minutos);
    const chave = `${ev.ponteId}|${inicio.toISOString()}`;
    if (!mapa.has(chave)) {
      mapa.set(chave, {
        chave,
        ponteId: ev.ponteId,
        inicio,
        fim: new Date(inicio.getTime() + duracaoMs),
        eventos: [],
      });
    }
    mapa.get(chave)!.eventos.push(ev);
  }

  return Array.from(mapa.values());
}

function aplicarKAnonimato(janela: JanelaCamera, k: number): JanelaCamera | null {
  return janela.eventos.length >= k ? janela : null;
}

function agregar(janela: JanelaCamera): EventoCameraAgregado {
  const totalVeiculos = janela.eventos.length;
  const somaVelocidade = janela.eventos.reduce((s, e) => s + e.velocidade, 0);
  const velocidadeMedia = Math.round((somaVelocidade / totalVeiculos) * 10) / 10;

  const distribuicaoModal: Record<TipoModal, number> = {
    carro: 0, onibus: 0, bicicleta: 0, a_pe: 0,
  };
  for (const ev of janela.eventos) {
    distribuicaoModal[ev.tipoVeiculo]++;
  }

  return {
    ponteId: janela.ponteId,
    janelaInicio: janela.inicio,
    janelaFim: janela.fim,
    totalVeiculos,
    velocidadeMedia,
    distribuicaoModal,
    kAnonimato: totalVeiculos,
    dadosPessoaisDescartados: true,
    conformeLGPD: true,
  };
}

export function executarPipeline(
  eventos: EventoCameraRaw[],
  k = K_MINIMO,
  minutos = JANELA_MINUTOS,
): EventoCameraAgregado[] {
  const janelas = agruparEmJanelas(eventos, minutos);
  const validas = janelas
    .map(j => aplicarKAnonimato(j, k))
    .filter((j): j is JanelaCamera => j !== null);
  return validas.map(agregar);
}

const CAMPOS_DESCARTADOS = ['placa', 'rostoDetectado', 'idMotorista'];
const BASE_JURIDICA = 'Art. 6, III LGPD — minimização de dados; Art. 11 LGPD — dado biométrico (proteção reforçada)';

export function gerarRelatorio(
  agregados: EventoCameraAgregado[],
  periodo: { inicio: Date; fim: Date },
  totalBrutos: number,
): RelatorioCameraLGPD {
  const totalJanelas = agregados.length;
  // janelasSuprimidas é inferido: total de janelas que seriam geradas sem k-anonimato
  // Como só recebemos as válidas, calculamos a partir da taxa de supressão esperada.
  // Aqui usamos a convenção: totalBrutos / k como estimativa do total de janelas tentadas.
  const janelasEstimadas = Math.ceil(totalBrutos / K_MINIMO);
  const janelasSuprimidas = Math.max(0, janelasEstimadas - totalJanelas);
  const taxaSupressao = janelasEstimadas > 0
    ? Math.round((janelasSuprimidas / janelasEstimadas) * 1000) / 1000
    : 0;
  const kMedio = totalJanelas > 0
    ? Math.round(agregados.reduce((s, a) => s + a.kAnonimato, 0) / totalJanelas * 10) / 10
    : 0;

  // Agregar por ponte
  const porPonte = new Map<string, EventoCameraAgregado[]>();
  for (const ag of agregados) {
    if (!porPonte.has(ag.ponteId)) porPonte.set(ag.ponteId, []);
    porPonte.get(ag.ponteId)!.push(ag);
  }

  const trafego = Array.from(porPonte.entries()).map(([ponteId, ags]) => {
    const totalVeiculos = ags.reduce((s, a) => s + a.totalVeiculos, 0);
    const velocidadeMedia = totalVeiculos > 0
      ? Math.round(
          ags.reduce((s, a) => s + a.velocidadeMedia * a.totalVeiculos, 0) / totalVeiculos * 10
        ) / 10
      : 0;

    const distribuicaoModal: Record<TipoModal, number> = {
      carro: 0, onibus: 0, bicicleta: 0, a_pe: 0,
    };
    for (const ag of ags) {
      for (const tipo of Object.keys(ag.distribuicaoModal) as TipoModal[]) {
        distribuicaoModal[tipo] += ag.distribuicaoModal[tipo];
      }
    }

    const picoAg = ags.length > 0
      ? ags.reduce((max, a) => a.totalVeiculos > max.totalVeiculos ? a : max, ags[0])
      : null;

    return {
      ponteId,
      totalVeiculos,
      velocidadeMedia,
      distribuicaoModal,
      janelaComPicoVeiculos: picoAg?.janelaInicio ?? new Date(0),
    };
  });

  return {
    geradoEm: new Date(),
    periodo,
    lgpd: {
      totalEventosBrutos: totalBrutos,
      janelasProcessadas: totalJanelas,
      janelasSuprimidas,
      taxaSupressao,
      camposDescartados: CAMPOS_DESCARTADOS,
      kMedio,
      baseJuridicaAplicada: BASE_JURIDICA,
    },
    trafego,
  };
}
