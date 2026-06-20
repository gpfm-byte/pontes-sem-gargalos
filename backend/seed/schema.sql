-- ============================================================
-- Pontes Sem Gargalos — Schema PostgreSQL + TimescaleDB
-- ============================================================
-- Executar após: CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Pontes
CREATE TABLE IF NOT EXISTS pontes (
  id                   TEXT PRIMARY KEY,
  nome                 TEXT NOT NULL,
  nome_completo        TEXT NOT NULL,
  capacidade_veiculos  INTEGER NOT NULL, -- veículos/hora
  lat                  DOUBLE PRECISION NOT NULL,
  lng                  DOUBLE PRECISION NOT NULL,
  ativa                BOOLEAN DEFAULT TRUE,
  criado_em            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leituras de sensor (hypertable — série temporal)
CREATE TABLE IF NOT EXISTS leituras_sensor (
  ponte_id             TEXT NOT NULL REFERENCES pontes(id),
  timestamp            TIMESTAMPTZ NOT NULL,
  veiculos_por_hora    INTEGER NOT NULL,
  ocupacao_pct         SMALLINT NOT NULL CHECK (ocupacao_pct BETWEEN 0 AND 100),
  velocidade_media     REAL,   -- km/h
  tempo_travessia      REAL,   -- minutos
  fonte                TEXT DEFAULT 'sensor'
);

-- Transforma em hypertable (particionamento automático por tempo)
SELECT create_hypertable('leituras_sensor', 'timestamp', if_not_exists => TRUE);

-- Compressão automática de dados com mais de 7 dias.
-- Recurso do TimescaleDB community/cloud; no Apache Edition (pacote do Fedora)
-- é ignorado graciosamente — não é requisito para o PoC.
DO $$
BEGIN
  ALTER TABLE leituras_sensor SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'ponte_id'
  );
  PERFORM add_compression_policy('leituras_sensor', INTERVAL '7 days', if_not_exists => TRUE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Compressao TimescaleDB indisponivel (Apache Edition): %', SQLERRM;
END $$;

-- 3. Previsões da IA (roadmap fase 2 — não usado pelo produto atual)
CREATE TABLE IF NOT EXISTS previsoes_ia (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ponte_id             TEXT NOT NULL REFERENCES pontes(id),
  gerada_em            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  horizonte            TEXT NOT NULL CHECK (horizonte IN ('2h','4h','6h')),
  modelo_versao        TEXT NOT NULL,
  pontos               JSONB NOT NULL, -- [{timestamp, veiculos_previsto, confianca}]
  acuracia_real        REAL            -- preenchido após o horizonte passar
);

-- 4. Alertas
CREATE TABLE IF NOT EXISTS alertas (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ponte_id             TEXT NOT NULL REFERENCES pontes(id),
  tipo                 TEXT NOT NULL CHECK (tipo IN ('congestionamento','acidente','alagamento','obra','evento')),
  nivel                TEXT NOT NULL CHECK (nivel IN ('baixo','medio','alto','critico')),
  mensagem             TEXT NOT NULL,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolvido_em         TIMESTAMPTZ,
  gerado_por_ia        BOOLEAN DEFAULT FALSE
);

-- 5. Usuários / Personas
CREATE TABLE IF NOT EXISTS usuarios (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                 TEXT NOT NULL CHECK (tipo IN ('logistica','trabalhador','gestor_publico')),
  nome                 TEXT NOT NULL,
  criado_em            TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Log de auditoria — cadeia imutável (US-15)
CREATE TABLE IF NOT EXISTS log_auditoria (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acao                 TEXT NOT NULL,
  decisao_ia           TEXT NOT NULL,
  decisao_humana       TEXT,            -- NULL = ação autônoma aprovada
  concordancia         BOOLEAN NOT NULL,
  hash_anterior        TEXT NOT NULL,   -- SHA-256 do registro anterior
  hash_atual           TEXT NOT NULL    -- SHA-256 deste registro (gerado pela app)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_leituras_ponte_ts ON leituras_sensor (ponte_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_ativos    ON alertas (ponte_id, criado_em DESC) WHERE resolvido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_previsoes_ponte   ON previsoes_ia (ponte_id, gerada_em DESC);

-- View útil: status atual de cada ponte (última leitura)
CREATE OR REPLACE VIEW status_atual_pontes AS
SELECT DISTINCT ON (ponte_id)
  p.nome,
  l.timestamp,
  l.veiculos_por_hora,
  l.ocupacao_pct,
  l.velocidade_media,
  l.tempo_travessia,
  CASE
    WHEN l.ocupacao_pct >= 90 THEN 'congestionado'
    WHEN l.ocupacao_pct >= 70 THEN 'atencao'
    ELSE 'normal'
  END AS status
FROM leituras_sensor l
JOIN pontes p ON p.id = l.ponte_id
ORDER BY ponte_id, timestamp DESC;
