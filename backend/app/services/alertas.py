"""Geração de alertas pelo sistema (por threshold, sem IA).

Um alerta ATIVO por ponte, em três níveis conforme o status:
  atenção      -> medio   (informativo)
  congestionado-> alto    (aviso)
  bloqueado    -> critico (crítico)
Abre quando entra em alerta, ESCALA/DES-ESCALA o nível quando o status muda, e
resolve (marca resolvido_em) quando volta ao normal. Persistido na tabela
`alertas` — vira um log que cresce e se resolve ao longo do tempo.
"""
from __future__ import annotations

from datetime import datetime
from typing import NamedTuple

from .compute import SENSOR_LABEL, derive_status

# status -> nível do alerta (normal não gera alerta)
NIVEL_POR_STATUS = {"atencao": "medio", "congestionado": "alto", "bloqueado": "critico"}


class StatusAtual(NamedTuple):
    ponte_id: str
    nome: str
    status: str
    ocupacao: int


def nivel_por_status(status: str) -> str | None:
    return NIVEL_POR_STATUS.get(status)


def mensagem_de(s: StatusAtual) -> str:
    sensor = SENSOR_LABEL.get(s.ponte_id, "CTTU")
    return f"{s.nome}: ocupação em {s.ocupacao}% — sensor {sensor} ({s.status}, threshold)"


def decidir(
    statuses: list[StatusAtual], ativos: dict[str, str]
) -> tuple[list[StatusAtual], list[StatusAtual], list[str]]:
    """Decide o que abrir, atualizar e resolver. Função pura — testável.

    `ativos`: ponte_id -> nível do alerta ativo atual.
    Retorna (a_criar, a_atualizar, a_resolver_ponte_ids).
    """
    criar: list[StatusAtual] = []
    atualizar: list[StatusAtual] = []
    resolver: list[str] = []
    for s in statuses:
        desejado = nivel_por_status(s.status)
        atual = ativos.get(s.ponte_id)
        if desejado is None:
            if atual is not None:
                resolver.append(s.ponte_id)
        elif atual is None:
            criar.append(s)
        elif atual != desejado:
            atualizar.append(s)
    return criar, atualizar, resolver


async def _status_atual(conn) -> list[StatusAtual]:
    """Status corrente por ponte = leitura da hora mais próxima de agora."""
    dia = await conn.fetchval("SELECT max(timestamp)::date FROM leituras_sensor")
    if dia is None:
        return []
    hora = datetime.now().hour
    pontes = await conn.fetch("SELECT id, nome FROM pontes WHERE ativa")
    out: list[StatusAtual] = []
    for p in pontes:
        rows = await conn.fetch(
            "SELECT extract(hour FROM timestamp)::int AS h, ocupacao_pct "
            "FROM leituras_sensor WHERE ponte_id = $1 AND timestamp::date = $2",
            p["id"], dia,
        )
        if not rows:
            continue
        best = min(rows, key=lambda r: abs(r["h"] - hora))
        out.append(StatusAtual(p["id"], p["nome"], derive_status(best["ocupacao_pct"]),
                               best["ocupacao_pct"]))
    return out


async def sincronizar_alertas(conn) -> tuple[list[StatusAtual], list[StatusAtual], list[str]]:
    """Abre/atualiza/resolve alertas conforme o status. Retorna (criados, atualizados, resolvidos)."""
    statuses = await _status_atual(conn)
    ativos = {
        r["ponte_id"]: r["nivel"]
        for r in await conn.fetch(
            "SELECT ponte_id, nivel FROM alertas WHERE resolvido_em IS NULL"
        )
    }
    criar, atualizar, resolver = decidir(statuses, ativos)

    for s in criar:
        await conn.execute(
            "INSERT INTO alertas (ponte_id, tipo, nivel, mensagem, gerado_por_ia) "
            "VALUES ($1, 'congestionamento', $2, $3, FALSE)",
            s.ponte_id, nivel_por_status(s.status), mensagem_de(s),
        )
    for s in atualizar:
        await conn.execute(
            "UPDATE alertas SET nivel = $2, mensagem = $3, criado_em = now() "
            "WHERE ponte_id = $1 AND resolvido_em IS NULL",
            s.ponte_id, nivel_por_status(s.status), mensagem_de(s),
        )
    for pid in resolver:
        await conn.execute(
            "UPDATE alertas SET resolvido_em = now() "
            "WHERE ponte_id = $1 AND resolvido_em IS NULL",
            pid,
        )
    return criar, atualizar, resolver
