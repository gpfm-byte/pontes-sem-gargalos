"""Transforma a agregação horária da CTTU em linhas de leituras_sensor.

Portado de getStatusPontes/getFluxoPorHora (src/services/PontesService.ts):
- calibração por sensor: fator = capacidade_ponte / capacidade_referência_sensor
- ocupação = veículos/hora ÷ capacidade (teto 100)
- velocidade penalizada quando a ocupação passa de 70%
- tempo de travessia ≈ 0,8 km ÷ velocidade

Função pura — testável sem banco nem rede.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from .cttu import CAPACIDADES, SENSOR_MAP

# Tupla pronta para INSERT em leituras_sensor.
LeituraRow = tuple[str, datetime, int, int, float, float, str]


def build_leituras(
    ponte_id: str,
    by_hora: dict[int, dict[str, float]],
    dia: date,
) -> list[LeituraRow]:
    cap = CAPACIDADES[ponte_id]
    cap_ref = float(SENSOR_MAP[ponte_id]["cap_ref"])
    fator = cap / cap_ref

    rows: list[LeituraRow] = []
    for h in sorted(by_hora):
        base = by_hora[h]
        vph = round(base["veiculos"] * fator)
        occ = min(100, round(vph / cap * 100)) if cap else 0
        vel = max(5, round(base["velocidade"] * (1.0 if occ < 70 else 0.65)))
        trav = round((0.8 / max(vel, 5)) * 60, 1)
        ts = datetime(dia.year, dia.month, dia.day, h, 0, tzinfo=timezone.utc)
        rows.append((ponte_id, ts, vph, occ, float(vel), float(trav), "cttu"))
    return rows
