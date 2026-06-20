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

// ─── Câmeras COP — Pipeline LGPD ─────────────────────────────────────────────

// Evento bruto da câmera — contém PII, NUNCA sai do pipeline
export interface EventoCameraRaw {
  cameraId: string;
  ponteId: string;
  timestamp: Date;
  placa: string;           // PII — descartado pelo pipeline
  rostoDetectado: boolean; // dado biométrico (Art. 11 LGPD) — descartado
  idMotorista: string;     // PII — descartado
  velocidade: number;      // km/h
  tipoVeiculo: TipoModal;
}

// Saída do pipeline — sem nenhum dado pessoal
export interface EventoCameraAgregado {
  ponteId: string;
  janelaInicio: Date;
  janelaFim: Date;
  totalVeiculos: number;
  velocidadeMedia: number;
  distribuicaoModal: Record<TipoModal, number>;
  kAnonimato: number;              // k efetivo da janela (sempre ≥ K_MINIMO)
  dadosPessoaisDescartados: true;  // literal para auditoria
  conformeLGPD: true;
}

// Relatório consolidado: conformidade LGPD + dados de tráfego
export interface RelatorioCameraLGPD {
  geradoEm: Date;
  periodo: { inicio: Date; fim: Date };
  lgpd: {
    totalEventosBrutos: number;
    janelasProcessadas: number;
    janelasSuprimidas: number;
    taxaSupressao: number;       // 0–1
    camposDescartados: string[];
    kMedio: number;
    baseJuridicaAplicada: string;
  };
  trafego: Array<{
    ponteId: string;
    totalVeiculos: number;
    velocidadeMedia: number;
    distribuicaoModal: Record<TipoModal, number>;
    janelaComPicoVeiculos: Date;
  }>;
}
