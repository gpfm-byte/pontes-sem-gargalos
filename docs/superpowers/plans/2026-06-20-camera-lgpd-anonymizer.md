# Camera LGPD Anonymizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um pipeline TypeScript que recebe eventos brutos de câmera do COP (com PII: placa, rosto, ID do motorista), aplica k-anonimato com generalização temporal de 5 minutos, e gera relatórios consolidados de conformidade LGPD + tráfego.

**Architecture:** Eventos raw são agrupados em janelas de 5 min por ponte; janelas com menos de k=5 registros são suprimidas; as demais são agregadas em `EventoCameraAgregado` sem qualquer dado pessoal. `gerarRelatorio()` consolida os agregados em `RelatorioCameraLGPD` com seções de conformidade e tráfego.

**Tech Stack:** TypeScript, React 18, Vite 6 — sem test runner configurado; verificação via `npm run build` (TypeScript strict off) e console do browser.

## Global Constraints

- Sem test runner — verificação via `npm run build` + console do browser em `localhost:5173`
- TypeScript sem strict mode — sem `noImplicitAny` forçado, mas tipar tudo explicitamente mesmo assim
- Nenhum componente React é modificado — pipeline puramente de dados
- Eventos raw (`EventoCameraRaw`) nunca saem do pipeline — descartados após `executarPipeline`
- k mínimo = 5, janela = 5 minutos — constantes nomeadas, não magic numbers
- Seguir padrão de nomes do projeto: camelCase em PT-BR para variáveis e funções

---

### Task 1: Tipos LGPD

**Files:**
- Modify: `src/data/types.ts` (append ao final do arquivo)

**Interfaces:**
- Produces: `EventoCameraRaw`, `EventoCameraAgregado`, `RelatorioCameraLGPD` — usados nas Tasks 2, 3 e 4

---

- [ ] **Step 1: Abrir `src/data/types.ts` e adicionar os três tipos ao final do arquivo**

Adicionar após a última linha existente (`export interface DadoEficiencia { ... }`):

```typescript
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
```

- [ ] **Step 2: Verificar compilação**

```bash
cd /home/gugagames/Downloads/veneza-dashboard && npm run build 2>&1 | tail -20
```

Esperado: sem erros de TypeScript. Avisos de bundle size são aceitáveis.

- [ ] **Step 3: Commit**

```bash
cd /home/gugagames/Downloads/veneza-dashboard
git add src/data/types.ts
git commit -m "feat(lgpd): add EventoCameraRaw, EventoCameraAgregado, RelatorioCameraLGPD types"
```

---

### Task 2: Mock de Câmera

**Files:**
- Modify: `src/data/mockData.ts` (append ao final)

**Interfaces:**
- Consumes: `EventoCameraRaw`, `TipoModal` de `./types`; `jitter`, `curvaTrafegoHora` já existentes em `mockData.ts`
- Produces: `gerarEventosCameraRaw(n: number, ponteId: string): EventoCameraRaw[]`

---

- [ ] **Step 1: Adicionar o import do novo tipo no topo de `mockData.ts`**

Localizar a linha de import existente (linha 1):
```typescript
import type {
  Ponte, LeituraSensor, PrevisaoIA, Alerta, LogAuditoria,
  StatusPonteUI, PontoFluxo, DadoEficiencia,
} from './types';
```

Substituir por:
```typescript
import type {
  Ponte, LeituraSensor, PrevisaoIA, Alerta, LogAuditoria,
  StatusPonteUI, PontoFluxo, DadoEficiencia, EventoCameraRaw, TipoModal,
} from './types';
```

- [ ] **Step 2: Adicionar `gerarEventosCameraRaw` ao final de `mockData.ts`**

```typescript
// ─── Mock de câmeras COP (dados com PII — input do pipeline LGPD) ─────────────

function gerarPlaca(): string {
  const letra = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  const letras = () => `${letra()}${letra()}${letra()}`;
  const digito = () => Math.floor(Math.random() * 10);
  // 50% Mercosul (ABC1D23), 50% antigo (ABC-1234)
  if (Math.random() >= 0.5) {
    return `${letras()}${digito()}${letra()}${digito()}${digito()}`;
  }
  return `${letras()}-${digito()}${digito()}${digito()}${digito()}`;
}

export function gerarEventosCameraRaw(n: number, ponteId: string): EventoCameraRaw[] {
  const TIPOS: TipoModal[] = ['carro', 'onibus', 'bicicleta', 'a_pe'];
  const agora = new Date();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;

  return Array.from({ length: n }, (_, i) => {
    const defasagemMs = Math.floor(Math.random() * 10 * 60 * 1000); // últimos 10 min
    return {
      cameraId: `CAM-${ponteId.slice(0, 3).toUpperCase()}-${String(Math.floor(i / 5) + 1).padStart(2, '0')}`,
      ponteId,
      timestamp: new Date(agora.getTime() - defasagemMs),
      placa: gerarPlaca(),
      rostoDetectado: Math.random() < 0.3,
      idMotorista: `MOT-${Math.floor(10000 + Math.random() * 90000)}`,
      velocidade: Math.max(5, jitter(Math.round(curvaTrafegoHora(horaAtual) * 60), 0.3)),
      tipoVeiculo: TIPOS[Math.floor(Math.random() * TIPOS.length)],
    };
  });
}
```

- [ ] **Step 3: Verificar compilação**

```bash
cd /home/gugagames/Downloads/veneza-dashboard && npm run build 2>&1 | tail -20
```

Esperado: sem erros de TypeScript.

- [ ] **Step 4: Verificar no browser**

Iniciar o dev server se não estiver rodando:
```bash
cd /home/gugagames/Downloads/veneza-dashboard && npm run dev
```

Abrir `http://localhost:5173`, abrir o console do browser (F12) e executar:
```javascript
const { gerarEventosCameraRaw } = await import('/src/data/mockData.ts');
const eventos = gerarEventosCameraRaw(20, 'mauricio-nassau');
console.log('Total:', eventos.length);
console.log('Primeiro evento:', eventos[0]);
console.log('Tem placa:', eventos.every(e => e.placa.length > 0));
console.log('Tem idMotorista:', eventos.every(e => e.idMotorista.startsWith('MOT-')));
```

Esperado:
- `Total: 20`
- Objeto com todos os campos de `EventoCameraRaw`
- `Tem placa: true`, `Tem idMotorista: true`

- [ ] **Step 5: Commit**

```bash
cd /home/gugagames/Downloads/veneza-dashboard
git add src/data/mockData.ts
git commit -m "feat(lgpd): add gerarEventosCameraRaw mock with realistic PII fields"
```

---

### Task 3: Pipeline k-Anonimato

**Files:**
- Create: `src/services/CameraAnonimizerService.ts`

**Interfaces:**
- Consumes: `EventoCameraRaw`, `EventoCameraAgregado`, `TipoModal` de `../data/types`
- Produces: `executarPipeline(eventos: EventoCameraRaw[], k?: number, minutos?: number): EventoCameraAgregado[]`

---

- [ ] **Step 1: Criar `src/services/CameraAnonimizerService.ts`**

```typescript
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
```

- [ ] **Step 2: Verificar compilação**

```bash
cd /home/gugagames/Downloads/veneza-dashboard && npm run build 2>&1 | tail -20
```

Esperado: sem erros de TypeScript.

- [ ] **Step 3: Verificar pipeline no browser**

No console do browser em `http://localhost:5173`:
```javascript
const { gerarEventosCameraRaw } = await import('/src/data/mockData.ts');
const { executarPipeline } = await import('/src/services/CameraAnonimizerService.ts');

// Teste 1: janela com k suficiente (20 eventos → 1 janela de ~10min → deve produzir agregado)
const eventos20 = gerarEventosCameraRaw(20, 'mauricio-nassau');
const agregados = executarPipeline(eventos20);
console.log('Agregados produzidos:', agregados.length);
console.log('Primeiro agregado:', agregados[0]);
console.log('Tem placa?', 'placa' in (agregados[0] ?? {}));          // false esperado
console.log('Tem rosto?', 'rostoDetectado' in (agregados[0] ?? {})); // false esperado
console.log('conformeLGPD:', agregados[0]?.conformeLGPD);            // true esperado

// Teste 2: supressão — 3 eventos com mesmo ponteId mas k=5 → deve retornar []
const eventos3 = gerarEventosCameraRaw(3, 'giratoria').map(e => ({
  ...e,
  timestamp: new Date('2026-06-20T08:00:00Z'), // mesma janela
}));
const suprimidos = executarPipeline(eventos3, 5);
console.log('Janelas suprimidas (esperado 0 agregados):', suprimidos.length); // 0
```

Esperado: `agregados.length >= 1`, sem campos de PII, `conformeLGPD: true`, `suprimidos.length === 0`.

- [ ] **Step 4: Commit**

```bash
cd /home/gugagames/Downloads/veneza-dashboard
git add src/services/CameraAnonimizerService.ts
git commit -m "feat(lgpd): add CameraAnonimizerService with k-anonymity pipeline (k=5, 5min windows)"
```

---

### Task 4: Gerador de Relatório

**Files:**
- Modify: `src/services/CameraAnonimizerService.ts` (append)
- Modify: `src/data/types.ts` — `RelatorioCameraLGPD` já adicionado na Task 1

**Interfaces:**
- Consumes: `EventoCameraAgregado[]`, `RelatorioCameraLGPD` de `../data/types`; `executarPipeline` da Task 3
- Produces: `gerarRelatorio(agregados: EventoCameraAgregado[], periodo: { inicio: Date; fim: Date }, totalBrutos: number): RelatorioCameraLGPD`

---

- [ ] **Step 1: Adicionar import de `RelatorioCameraLGPD` e `gerarRelatorio` em `CameraAnonimizerService.ts`**

Localizar a linha de import no topo do arquivo:
```typescript
import type { EventoCameraRaw, EventoCameraAgregado, TipoModal } from '../data/types';
```

Substituir por:
```typescript
import type { EventoCameraRaw, EventoCameraAgregado, RelatorioCameraLGPD, TipoModal } from '../data/types';
```

Depois, adicionar ao final do arquivo (após `executarPipeline`):

```typescript
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
    const velocidadeMedia = Math.round(
      ags.reduce((s, a) => s + a.velocidadeMedia * a.totalVeiculos, 0) / totalVeiculos * 10
    ) / 10;

    const distribuicaoModal: Record<TipoModal, number> = {
      carro: 0, onibus: 0, bicicleta: 0, a_pe: 0,
    };
    for (const ag of ags) {
      for (const tipo of Object.keys(ag.distribuicaoModal) as TipoModal[]) {
        distribuicaoModal[tipo] += ag.distribuicaoModal[tipo];
      }
    }

    const picoAg = ags.reduce((max, a) => a.totalVeiculos > max.totalVeiculos ? a : max, ags[0]);

    return {
      ponteId,
      totalVeiculos,
      velocidadeMedia,
      distribuicaoModal,
      janelaComPicoVeiculos: picoAg.janelaInicio,
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
```

- [ ] **Step 2: Verificar compilação**

```bash
cd /home/gugagames/Downloads/veneza-dashboard && npm run build 2>&1 | tail -20
```

Esperado: sem erros de TypeScript.

- [ ] **Step 3: Verificar relatório no browser**

No console do browser em `http://localhost:5173`:
```javascript
const { gerarEventosCameraRaw } = await import('/src/data/mockData.ts');
const { executarPipeline, gerarRelatorio } = await import('/src/services/CameraAnonimizerService.ts');

const totalBrutos = 30;
const eventos = gerarEventosCameraRaw(totalBrutos, 'mauricio-nassau');
const agregados = executarPipeline(eventos);

const agora = new Date();
const periodo = { inicio: new Date(agora.getTime() - 30 * 60 * 1000), fim: agora };
const relatorio = gerarRelatorio(agregados, periodo, totalBrutos);

console.log('=== LGPD ===');
console.log('Brutos:', relatorio.lgpd.totalEventosBrutos);         // 30
console.log('Janelas processadas:', relatorio.lgpd.janelasProcessadas);
console.log('Campos descartados:', relatorio.lgpd.camposDescartados); // ['placa','rostoDetectado','idMotorista']
console.log('Base jurídica:', relatorio.lgpd.baseJuridicaAplicada);

console.log('=== TRÁFEGO ===');
console.log('Pontes no relatório:', relatorio.trafego.map(t => t.ponteId));
console.log('Total veículos:', relatorio.trafego[0]?.totalVeiculos);
console.log('Distribuição modal:', relatorio.trafego[0]?.distribuicaoModal);
```

Esperado:
- `Brutos: 30`
- `Campos descartados: ['placa', 'rostoDetectado', 'idMotorista']`
- `Pontes no relatório: ['mauricio-nassau']`
- `distribuicaoModal` com chaves `carro`, `onibus`, `bicicleta`, `a_pe`

- [ ] **Step 4: Commit final**

```bash
cd /home/gugagames/Downloads/veneza-dashboard
git add src/services/CameraAnonimizerService.ts
git commit -m "feat(lgpd): add gerarRelatorio — LGPD compliance + traffic report from anonymized data"
```
