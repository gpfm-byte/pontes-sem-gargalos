# Pontes Sem Gargalos

Plataforma que abre os silos de dados de trânsito do Recife e os entrega num
dashboard público de fluxo viário para as 3 pontes históricas de acesso ao
Bairro do Recife: **Buarque de Macedo**, **Maurício de Nassau** e **Giratória**.

O problema é informacional, não físico: as pontes são tombadas. A plataforma
integra e faz a curadoria do dado aberto da CTTU e o serve numa interface única.

> Projeto Integrador — Cadeira de Inovação (MINTE²), CESAR School · Grupo 01.

## Arquitetura

```
Dado aberto CTTU (velocidade 2018, ODbL)
        │  backend/seed/ingest_cttu.py
        ▼
PostgreSQL + TimescaleDB  (série temporal)
        │  FastAPI (REST /api/*)
        ▼
React + TypeScript + Vite  (dashboard)
```

- **`src/`** — dashboard React (TypeScript, Vite, Tailwind, Recharts, Radix).
- **`backend/`** — API FastAPI + PostgreSQL/TimescaleDB. Veja
  [`backend/README.md`](backend/README.md).

O dashboard tem 3 fontes de dados, selecionadas por `VITE_DATA_SOURCE`:
`mock` (sintético), `cttu` (proxy direto do dado aberto) e `api` (back-end próprio).

## Rodar o front

```bash
npm install
cp .env.example .env     # ajuste VITE_DATA_SOURCE e a chave do Maps
npm run dev              # http://localhost:5174
```

## Rodar o back-end

Veja [`backend/README.md`](backend/README.md). Resumo:

```bash
sudo bash backend/seed/bootstrap_db.sh        # instala/cria o banco (1x)
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
psql -d pontes -f seed/schema.sql
.venv/bin/python -m seed.seed_pontes
.venv/bin/python -m seed.ingest_cttu
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Depois, no `.env` da raiz: `VITE_DATA_SOURCE=api`.

## Tecnologias

- **Front:** React 18, TypeScript, Vite, Tailwind CSS 4, Recharts, Radix UI.
- **Back:** Python, FastAPI, asyncpg, PostgreSQL + TimescaleDB, Pydantic.

## Fonte dos dados

Dados abertos da CTTU (Companhia de Trânsito e Transporte Urbano do Recife),
portal [dados.recife.pe.gov.br](https://dados.recife.pe.gov.br), licença ODbL.
Sensores no Bairro do Recife: FS002REC (Rua Madre de Deus) e FS003REC
(Av. Marquês de Olinda). O dado de velocidade é histórico (2018).
