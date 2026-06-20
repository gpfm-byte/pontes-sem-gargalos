# Design — Pipeline de Anonimização LGPD para Câmeras COP

**Data:** 2026-06-20  
**Projeto:** Pontes Sem Gargalos — veneza-dashboard  
**Escopo:** Pipeline de dados TypeScript que recebe eventos brutos de câmera do COP e aplica k-anonimato com generalização temporal antes de qualquer armazenamento ou exibição.

---

## Contexto

As câmeras do COP (Centro de Operações e Planejamento) capturam dados de tráfego que incluem dados pessoais: placas de veículos, rostos detectados e IDs de motoristas. A LGPD (Lei 13.709/2018) exige base legal e minimização de dados para qualquer tratamento de dados pessoais — especialmente dados biométricos (Art. 11), que têm proteção reforçada.

A solução adota **k-anonimato com generalização temporal**: eventos individuais são agrupados em janelas de 5 minutos e suprimidos se a janela não atingir k=5 registros. Nenhum dado pessoal sobrevive ao pipeline — nem mesmo em forma de hash.

---

## Arquitetura

```
EventoCameraRaw[]
    │
    ▼
agruparEmJanelas(5min)
    │
    ▼
aplicarKAnonimato(k=5)  ──→  null (janela suprimida se < k registros)
    │
    ▼
agregar (strip total de PII)
    │
    ▼
EventoCameraAgregado[]  ──→  PontesService / LeituraSensor
```

---

## Tipos Novos (`src/data/types.ts`)

### `EventoCameraRaw`
Evento bruto como chegaria da câmera. **Nunca sai do pipeline.**

```ts
export interface EventoCameraRaw {
  cameraId: string;
  ponteId: string;
  timestamp: Date;
  placa: string;           // ex: "ABC-1D23" — PII, descartado
  rostoDetectado: boolean; // dado biométrico (Art. 11 LGPD), descartado
  idMotorista: string;     // PII, descartado
  velocidade: number;      // km/h — não pessoal, fica no agregado
  tipoVeiculo: TipoModal;  // não pessoal, fica no agregado
}
```

### `JanelaCamera`
Agrupamento temporal intermediário — interno ao serviço.

```ts
interface JanelaCamera {
  chave: string;           // "{ponteId}|{inicio.toISOString()}"
  ponteId: string;
  inicio: Date;
  fim: Date;
  eventos: EventoCameraRaw[];
}
```

### `EventoCameraAgregado`
Saída do pipeline — sem PII. Compatível com o shape de `LeituraSensor`.

```ts
export interface EventoCameraAgregado {
  ponteId: string;
  janelaInicio: Date;      // início do intervalo de 5min
  janelaFim: Date;
  totalVeiculos: number;
  velocidadeMedia: number; // km/h
  distribuicaoModal: Record<TipoModal, number>; // contagem por tipo
  kAnonimato: number;      // k efetivo da janela (≥ 5 sempre)
  dadosPessoaisDescartados: true;  // literal — auditável
  conformeLGPD: true;
}
```

### `RelatorioCameraLGPD`
Saída de `gerarRelatorio()` — consolida conformidade LGPD + dados operacionais de tráfego.

```ts
export interface RelatorioCameraLGPD {
  geradoEm: Date;
  periodo: { inicio: Date; fim: Date };

  // Seção conformidade LGPD
  lgpd: {
    totalEventosBrutos: number;       // eventos raw recebidos
    janelasProcessadas: number;       // janelas com k ≥ 5
    janelasSuprimidas: number;        // janelas descartadas (k < 5)
    taxaSupressao: number;            // janelasSuprimidas / total (0–1)
    camposDescartados: string[];      // ['placa','rostoDetectado','idMotorista']
    kMedio: number;                   // média de k das janelas válidas
    baseJuridicaAplicada: string;     // "Art. 6, III LGPD — minimização de dados"
  };

  // Seção tráfego (dados agregados por ponte)
  trafego: Array<{
    ponteId: string;
    totalVeiculos: number;
    velocidadeMedia: number;          // km/h
    distribuicaoModal: Record<TipoModal, number>;
    janelaComPicoVeiculos: Date;     // janelainicio da janela com mais veículos
  }>;
}
```

---

## Serviço (`src/services/CameraAnonimizerService.ts`)

### Funções públicas

| Função | Assinatura | Descrição |
|---|---|---|
| `executarPipeline` | `(eventos: EventoCameraRaw[]): EventoCameraAgregado[]` | Orquestra todo o pipeline |
| `gerarRelatorio` | `(agregados: EventoCameraAgregado[], periodo: { inicio: Date; fim: Date }, totalBrutos: number): RelatorioCameraLGPD` | Consolida conformidade LGPD + tráfego em tempo real |

`gerarRelatorio` é determinístico: dado o mesmo conjunto de agregados, produz sempre o mesmo relatório. `totalBrutos` é passado explicitamente porque os eventos raw são descartados após o pipeline — o serviço não os retém.

O gerador de mock (`gerarEventosCameraRaw`) vive em `mockData.ts` — o serviço é agnóstico à origem dos dados e só processa.

### Funções internas

| Função | Descrição |
|---|---|
| `agruparEmJanelas(eventos, minutos=5)` | Bucketing temporal: arredonda timestamp ao múltiplo de 5min e agrupa por `ponteId + janela` |
| `aplicarKAnonimato(janela, k=5)` | Retorna `null` se `janela.eventos.length < k` — supressão silenciosa |
| `agregar(janela)` | Strip completo de PII; calcula médias e distribuição modal |

### Regras LGPD aplicadas

| Campo bruto | Tratamento | Base legal |
|---|---|---|
| `placa` | Descartado (não vai a lugar algum) | Art. 6, III — adequação e necessidade |
| `rostoDetectado` | Descartado | Art. 11 — dado biométrico, proteção reforçada |
| `idMotorista` | Descartado | Art. 6, III — minimização |
| `timestamp` individual | Substituído por intervalo de janela | Art. 6, III — generalização temporal |
| `velocidade` | Mantido (média agregada) | Não é dado pessoal |
| `tipoVeiculo` | Mantido (contagem agregada) | Não é dado pessoal |
| Janela com < k=5 eventos | Suprimida inteiramente | Art. 6, IV — qualidade |

---

## Mock (`src/data/mockData.ts`)

Adicionar `gerarEventosCameraRaw(n: number, ponteId: string): EventoCameraRaw[]`:
- Placas no formato BR (ex: `"ABC-1234"` e `"XYZ-5E67"` para misturar Mercosul)
- `rostoDetectado`: ~30% true (motoristas com janela baixa)
- `idMotorista`: formato `"MOT-XXXXX"` (numérico aleatório)
- Timestamps distribuídos em janelas de 5min ao redor de `new Date()`
- Velocidades com curva realista por hora do dia (reusar `curvaTrafegoHora`)

---

## Integração com PontesService

`EventoCameraAgregado` mapeia para `LeituraSensor` da seguinte forma:

| `EventoCameraAgregado` | `LeituraSensor` |
|---|---|
| `totalVeiculos` | `veiculosPorHora` (× 12 para extrapolar 5min → 1h) |
| `velocidadeMedia` | `velocidadeMedia` |
| `janelaInicio` | `timestamp` |
| `ponteId` | `ponteId` |

A `fonte` da leitura seria `'camera_cop_anonimizada'` no schema SQL.

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `src/data/types.ts` | Adicionar `EventoCameraRaw`, `EventoCameraAgregado`, `RelatorioCameraLGPD` |
| `src/services/CameraAnonimizerService.ts` | Criar — pipeline completo |
| `src/data/mockData.ts` | Adicionar `gerarEventosCameraRaw()` |

Nenhum componente React é modificado — o pipeline é puramente de dados.

---

## Fora de Escopo

- UI de governança / painel LGPD (escolha do usuário: opção 1, pipeline apenas)
- Integração com API real do COP
- Hash de placa (pseudonimização) — substituído por supressão total via k-anonimato
- Testes automatizados (projeto sem test runner configurado)
