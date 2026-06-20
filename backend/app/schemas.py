"""Modelos Pydantic = contrato da API. Espelham src/data/types.ts.

Campos em snake_case com alias camelCase: a serialização (by_alias do FastAPI)
devolve JSON em camelCase, igual ao que o front já espera.
"""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

StatusPonte = Literal["normal", "atencao", "congestionado", "bloqueado"]
NivelAlerta = Literal["baixo", "medio", "alto", "critico"]
Cor = Literal["green", "orange", "red"]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Coordenadas(CamelModel):
    lat: float
    lng: float


class Ponte(CamelModel):
    id: str
    nome: str
    nome_completo: str
    capacidade_veiculos: int
    coordenadas: Coordenadas


class LeituraSensor(CamelModel):
    ponte_id: str
    timestamp: datetime
    veiculos_por_hora: int
    ocupacao_pct: int
    velocidade_media: float
    tempo_de_travessia: float


class StatusPonteUI(CamelModel):
    ponte: Ponte
    leitura_atual: LeituraSensor
    status: StatusPonte
    cor: Cor


class PontoFluxo(CamelModel):
    hora: str
    veiculos: int


class Alerta(CamelModel):
    id: str
    ponte_id: str
    tipo: Literal["congestionamento", "acidente", "alagamento", "obra", "evento"]
    nivel: NivelAlerta
    mensagem: str
    criado_em: datetime
    resolvido_em: Optional[datetime] = None
    # alias explícito: to_camel geraria "geradoPorIa", mas o front usa "geradoPorIA"
    gerado_por_ia: bool = Field(default=False, alias="geradoPorIA")


class Health(CamelModel):
    status: str
    db: str
