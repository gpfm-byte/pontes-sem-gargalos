"""Derivações de UI a partir das leituras: status/cor e alertas por threshold.

Mesmos limiares do front (CTTUPontesService): ocupação >=90 bloqueado,
>=75 congestionado, >=50 atenção, senão normal. Sem IA — só threshold.
"""
from __future__ import annotations

from ..schemas import Alerta, Cor, LeituraSensor, StatusPonte, StatusPonteUI

# ponte_id -> rótulo do sensor (para a mensagem do alerta)
SENSOR_LABEL = {
    "buarque-de-macedo": "FS002REC",
    "mauricio-nassau": "FS002REC",
    "giratoria": "FS003REC",
}


def derive_status(ocupacao_pct: int) -> StatusPonte:
    if ocupacao_pct >= 90:
        return "bloqueado"
    if ocupacao_pct >= 75:
        return "congestionado"
    if ocupacao_pct >= 50:
        return "atencao"
    return "normal"


def status_cor(status: StatusPonte) -> Cor:
    if status == "normal":
        return "green"
    if status == "atencao":
        return "orange"
    return "red"


def pick_closest_hour(leituras: list[LeituraSensor], target_hour: int) -> LeituraSensor:
    """Escolhe a leitura cuja hora é a mais próxima da hora alvo (igual ao front)."""
    return min(leituras, key=lambda lt: abs(lt.timestamp.hour - target_hour))


def alerta_de_status(s: StatusPonteUI, criado_em) -> Alerta | None:
    """Gera alerta de congestionamento se a ponte estiver congestionada/bloqueada."""
    if s.status not in ("congestionado", "bloqueado"):
        return None
    sensor = SENSOR_LABEL.get(s.ponte.id, "CTTU")
    return Alerta(
        id=f"cttu-{s.ponte.id}",
        ponte_id=s.ponte.id,
        tipo="congestionamento",
        nivel="critico" if s.status == "bloqueado" else "alto",
        mensagem=(
            f"{s.ponte.nome}: {s.leitura_atual.ocupacao_pct}% ocupação "
            f"— sensor {sensor} (threshold)"
        ),
        criado_em=criado_em,
        resolvido_em=None,
        gerado_por_ia=False,
    )
