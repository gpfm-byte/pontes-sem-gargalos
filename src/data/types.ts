// ─── Entidades do Sistema ────────────────────────────────────────────────────

export type StatusPonte = 'normal' | 'atencao' | 'congestionado' | 'bloqueado';
export type NivelAlerta = 'baixo' | 'medio' | 'alto' | 'critico';
export type TipoModal = 'carro' | 'onibus' | 'bicicleta' | 'a_pe';

// 1. Ponte
export interface Ponte {
  id: string;
  nome: string;
  nomeCompleto: string;
  capacidadeVeiculos: number; // veículos/hora
  coordenadas: { lat: number; lng: number };
}

// 2. Leitura de Sensor (série temporal → TimescaleDB)
export interface LeituraSensor {
  ponteId: string;
  timestamp: Date;
  veiculosPorHora: number;
  ocupacaoPct: number;      // 0–100
  velocidadeMedia: number;  // km/h
  tempoDeTravessia: number; // minutos
}

// 3. Previsão da IA
export interface PrevisaoIA {
  ponteId: string;
  geradaEm: Date;
  horizonte: '2h' | '4h' | '6h';
  pontos: Array<{
    timestamp: Date;
    veiculosPrevisto: number;
    confianca: number; // 0–1
  }>;
  modeloVersao: string;
}

// 4. Alerta
export interface Alerta {
  id: string;
  ponteId: string;
  tipo: 'congestionamento' | 'acidente' | 'alagamento' | 'obra' | 'evento';
  nivel: NivelAlerta;
  mensagem: string;
  criadoEm: Date;
  resolvidoEm: Date | null;
  geradoPorIA: boolean;
}

// 5. Usuário / Persona
export interface Usuario {
  id: string;
  tipo: 'logistica' | 'trabalhador' | 'gestor_publico';
  nome: string;
}

// 6. Log de Auditoria (US-15 — rastreabilidade criptográfica)
export interface LogAuditoria {
  id: string;
  timestamp: Date;
  acao: string;
  decisaoIA: string;
  decisaoHumana: string | null;
  concordancia: boolean;
  hash: string; // SHA-256 do registro anterior (cadeia imutável)
}

// ─── Tipos de UI (agregados para os componentes) ─────────────────────────────

export interface StatusPonteUI {
  ponte: Ponte;
  leituraAtual: LeituraSensor;
  status: StatusPonte;
  cor: 'green' | 'orange' | 'red';
}

export interface PontoFluxo {
  hora: string;
  veiculos: number;
  previsto?: number;
}

export interface DadoEficiencia {
  dia: string;
  antesMin: number;
  depoisMin: number;
}
