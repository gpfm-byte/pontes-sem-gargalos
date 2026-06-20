import type { EventoCameraRaw, EventoCameraAgregado, TipoModal } from '../data/types';

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
