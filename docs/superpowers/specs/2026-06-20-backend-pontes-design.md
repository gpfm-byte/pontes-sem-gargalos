# Back-end Pontes Sem Gargalos / Veneza — Design

**Data:** 2026-06-20
**Autor:** Claudio (com aprovação do Guga)
**Status:** Aprovado para implementação

## Objetivo

Plugar um back-end real ao dashboard `veneza-dashboard`. Hoje o front consome
o dado aberto da CTTU direto, via proxy do Vite. O back-end passa a ser a fonte:
ingere o dado da CTTU num PostgreSQL + TimescaleDB (schema já existente em
`src/data/schema.sql`) e serve uma API REST que o front consome.

Isto concretiza o que o Artefato IV e o slide "01 SQL+TimescaleDB" prometem.

## Fluxo de dados

```
Dado aberto CTTU (velocidade 2018, ODbL)
        │  ingest_cttu.py (1x / sob demanda)
        ▼
PostgreSQL + TimescaleDB  (hypertable leituras_sensor, schema.sql)
        ▲
        │  asyncpg
   FastAPI  (REST /api/*)
        ▲
        │  fetch(VITE_API_URL)
  React front (veneza-dashboard)  — modo VITE_DATA_SOURCE=api
```

## Contrato da API

Espelha `IPontesService` / `src/data/types.ts`. JSON em **camelCase** para o
front não mudar de forma.

| Método | Rota | Resposta |
|--------|------|----------|
| GET | `/api/pontes` | `Ponte[]` |
| GET | `/api/status` | `StatusPonteUI[]` (status/cor por threshold de ocupação) |
| GET | `/api/fluxo?ponteId=` | `PontoFluxo[]` (veículos por hora) |
| GET | `/api/alertas` | `Alerta[]` (congestionamento por threshold, `geradoPorIA:false`) |
| GET | `/api/health` | `{status, db}` |

Fora do produto (pós-pivô): previsão, eficiência, auditoria. Não expostos.

## Estrutura

```
veneza-dashboard/backend/
  app/
    main.py              FastAPI + CORS + routers
    config.py            settings via env (DATABASE_URL, CTTU_*, CORS_ORIGINS)
    db.py                pool asyncpg
    schemas.py           Pydantic = contrato (camelCase via alias)
    routers/
      pontes.py  status.py  fluxo.py  alertas.py  health.py
    services/
      compute.py         regras de status/alerta por threshold (90/75/50)
  seed/
    schema.sql           cópia do schema TimescaleDB
    seed_pontes.py       insere as 3 pontes
    ingest_cttu.py       CTTU → agrega (buckets/calibração) → leituras_sensor
  tests/
    test_endpoints.py    4 endpoints (httpx + ASGI)
    test_aggregation.py  agregação de buckets com fixture CTTU
  requirements.txt
  .env.example
  README.md
```

## Decisões

1. **Agregação no ingest, não na API.** A lógica de buckets de velocidade →
   veículos/hora, calibração por sensor (FS002REC/FS003REC) e thresholds é
   portada de `src/services/PontesService.ts` para `ingest_cttu.py`. O banco
   guarda leituras já agregadas; a API só lê. Comportamento idêntico ao atual.
2. **3 pontes:** Buarque de Macedo, Maurício de Nassau (sensor FS002REC),
   Giratória (sensor FS003REC).
3. **Front:** novo `ApiPontesService` em `PontesService.ts`, modo
   `VITE_DATA_SOURCE=api` apontando para `VITE_API_URL`. Modos `mock`/`cttu`
   seguem funcionando. Componentes não mudam.
4. **Status/cor:** ocupação ≥90 bloqueado/red, ≥75 congestionado/red,
   ≥50 atenção/orange, senão normal/green (igual ao front hoje).

## Erros / bordas

- API sem dado no banco → retorna array vazio (front tem fallback mock).
- `/api/health` reporta conectividade do DB.
- CORS liberado para as origens de dev (localhost:5174 e afins).

## Testes

pytest: 4 endpoints via ASGI transport (httpx) com banco de teste ou dados
semeados; agregação de buckets validada com fixture pequena de registros CTTU.

## Risco

TimescaleDB no Fedora exige repo oficial da Timescale + casar versão do
PostgreSQL. Passo mais frágil. Fallback: PostgreSQL puro, trocando
`create_hypertable` por tabela comum particionada/indexada.
