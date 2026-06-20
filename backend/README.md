# Back-end — Pontes Sem Gargalos / Veneza

API REST (FastAPI) que serve o contrato do dashboard a partir de um
**PostgreSQL + TimescaleDB** alimentado com o **dado aberto da CTTU**
(velocidade das vias 2018, Bairro do Recife, licença ODbL).

```
Dado aberto CTTU ──(seed/ingest_cttu.py)──▶ PostgreSQL + TimescaleDB ──(FastAPI)──▶ dashboard
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pontes` | As 3 pontes do Bairro do Recife |
| GET | `/api/status` | Status atual por ponte (threshold de ocupação) |
| GET | `/api/fluxo?ponteId=` | Veículos por hora (06h–21h) |
| GET | `/api/alertas` | Alertas de congestionamento (por threshold) |
| GET | `/api/health` | Saúde do serviço e do banco |
| GET | `/docs` | Swagger UI |

JSON em camelCase, espelhando `src/data/types.ts` do front.

## Setup

### 1. Banco (uma vez, precisa de sudo)

```bash
sudo bash seed/bootstrap_db.sh
```

Instala PostgreSQL + TimescaleDB (Fedora), cria o banco `pontes` e a extensão.

### 2. Ambiente Python

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # ajuste se necessário
```

### 3. Schema + dados

```bash
.venv/bin/psql -d pontes -f seed/schema.sql   # ou: psql -d pontes -f seed/schema.sql
.venv/bin/python -m seed.seed_pontes
.venv/bin/python -m seed.ingest_cttu
```

### 4. Subir a API

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
```

### 5. Ligar o front ao back-end

No `.env` do projeto (raiz):

```
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:8000/api
```

## Testes

```bash
.venv/bin/python -m pytest
```

Os testes não precisam de banco nem rede: o acesso ao banco é injetado e
sobrescrito por um repositório fake. Cobrem o contrato dos endpoints e a
agregação do dado da CTTU.

## Estrutura

```
app/
  main.py            FastAPI + CORS + routers
  config.py          configuração via .env
  db.py              pool asyncpg
  deps.py            injeção do repositório (sobrescrita nos testes)
  repository.py      todo o SQL
  schemas.py         contrato Pydantic (camelCase)
  routers/           pontes, status, fluxo, alertas, health
  services/
    cttu.py          agregação das faixas de velocidade (puro)
    ingest_math.py   agregação horária -> leituras (puro)
    compute.py       status/cor e alertas por threshold
seed/
  schema.sql         schema PostgreSQL + TimescaleDB
  bootstrap_db.sh    instalação/criação do banco (sudo)
  seed_pontes.py     insere as 3 pontes
  ingest_cttu.py     ingestão do dado aberto da CTTU
tests/               pytest
```
