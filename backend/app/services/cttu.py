"""Agregação do dado aberto da CTTU (velocidade das vias 2018).

Portado de src/services/PontesService.ts (CTTUPontesService): cada registro traz
contagens por faixa de velocidade (qtd_0a10km ... qtd_acimade100km). O total de
veículos é a soma das faixas; a velocidade média é a média ponderada pelos
pontos médios de cada faixa.

Funções puras — testáveis sem banco nem rede.
"""
from __future__ import annotations

# faixa -> ponto médio de velocidade (km/h)
BUCKETS: list[tuple[str, float]] = [
    ("qtd_0a10km", 5.0),
    ("qtd_11a20km", 15.5),
    ("qtd_21a30km", 25.5),
    ("qtd_31a40km", 35.5),
    ("qtd_41a50km", 45.5),
    ("qtd_51a60km", 55.5),
    ("qtd_61a70km", 65.5),
    ("qtd_71a80km", 75.5),
    ("qtd_81a90km", 85.5),
    ("qtd_91a100km", 95.5),
    ("qtd_acimade100km", 110.0),
]

# Cada ponte -> sensor CTTU e capacidade de referência do sensor (calibração).
SENSOR_MAP: dict[str, dict[str, float | str]] = {
    "buarque-de-macedo": {"eq": "FS002REC", "cap_ref": 900},
    "mauricio-nassau": {"eq": "FS002REC", "cap_ref": 900},
    "giratoria": {"eq": "FS003REC", "cap_ref": 180},
}

# Capacidade real de cada ponte (veículos/hora) — igual ao mockData/types.
CAPACIDADES: dict[str, int] = {
    "buarque-de-macedo": 800,
    "mauricio-nassau": 1000,
    "giratoria": 600,
}


def _num(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def total_count(rec: dict) -> float:
    """Soma das contagens de todas as faixas de velocidade do registro."""
    return sum(_num(rec.get(field)) for field, _ in BUCKETS)


def avg_speed(rec: dict) -> float:
    """Velocidade média ponderada pelas faixas. 0 se não houver contagem."""
    total = 0.0
    soma = 0.0
    for field, mid in BUCKETS:
        n = _num(rec.get(field))
        total += n
        soma += n * mid
    return soma / total if total > 0 else 0.0


def aggregate(records: list[dict]) -> dict[int, dict[str, float]]:
    """Agrupa por hora: total de veículos e velocidade média ponderada.

    Retorna {hora: {"veiculos": float, "velocidade": float}}.
    """
    acc: dict[int, dict[str, float]] = {}
    for rec in records:
        try:
            h = int(_num(rec.get("hora")))
        except (TypeError, ValueError):
            continue
        a = acc.setdefault(h, {"cnt": 0.0, "vel_peso": 0.0})
        n = total_count(rec)
        a["cnt"] += n
        a["vel_peso"] += avg_speed(rec) * n

    out: dict[int, dict[str, float]] = {}
    for h, a in acc.items():
        out[h] = {
            "veiculos": a["cnt"],
            "velocidade": (a["vel_peso"] / a["cnt"]) if a["cnt"] > 0 else 20.0,
        }
    return out
