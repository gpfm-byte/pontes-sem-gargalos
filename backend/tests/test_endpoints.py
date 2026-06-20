"""Testa os endpoints via ASGI (sem banco): get_repo é sobrescrito por um fake.

Cobre o contrato (camelCase) e a derivação de status/alertas.
"""
from datetime import date, datetime, timezone

import httpx
import pytest

from app.deps import get_repo
from app.main import app
from app.schemas import Coordenadas, LeituraSensor, Ponte

DIA = date(2018, 8, 28)

PONTES = [
    Ponte(id="buarque-de-macedo", nome="Buarque de Macedo",
          nome_completo="Ponte Buarque de Macedo", capacidade_veiculos=800,
          coordenadas=Coordenadas(lat=-8.0598, lng=-34.8741)),
    Ponte(id="mauricio-nassau", nome="Maurício de Nassau",
          nome_completo="Ponte Maurício de Nassau", capacidade_veiculos=1000,
          coordenadas=Coordenadas(lat=-8.0635, lng=-34.8719)),
    Ponte(id="giratoria", nome="Giratória",
          nome_completo="Ponte Giratória (Ponte Velha)", capacidade_veiculos=600,
          coordenadas=Coordenadas(lat=-8.0660, lng=-34.8735)),
]

# Ocupação fixa por ponte -> status determinístico independente da hora do teste.
OCUPACAO = {"buarque-de-macedo": 40, "mauricio-nassau": 95, "giratoria": 80}


class FakeRepo:
    async def get_pontes(self):
        return PONTES

    async def latest_day(self):
        return DIA

    async def get_leituras(self, ponte_id, dia):
        occ = OCUPACAO[ponte_id]
        # Uma leitura por hora (0..23), todas com a mesma ocupação.
        return [
            LeituraSensor(
                ponte_id=ponte_id,
                timestamp=datetime(DIA.year, DIA.month, DIA.day, h, 0, tzinfo=timezone.utc),
                veiculos_por_hora=h * 10,
                ocupacao_pct=occ,
                velocidade_media=30.0,
                tempo_de_travessia=2.0,
            )
            for h in range(24)
        ]

    async def ping(self):
        return True


@pytest.fixture(autouse=True)
def _override_repo():
    app.dependency_overrides[get_repo] = lambda: FakeRepo()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def test_get_pontes_contrato_camelcase(client):
    r = await client.get("/api/pontes")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 3
    p = data[0]
    assert {"id", "nome", "nomeCompleto", "capacidadeVeiculos", "coordenadas"} <= p.keys()
    assert {"lat", "lng"} <= p["coordenadas"].keys()


async def test_get_status_deriva_status_e_cor(client):
    r = await client.get("/api/status")
    assert r.status_code == 200
    by_id = {s["ponte"]["id"]: s for s in r.json()}
    assert by_id["buarque-de-macedo"]["status"] == "normal"
    assert by_id["buarque-de-macedo"]["cor"] == "green"
    assert by_id["mauricio-nassau"]["status"] == "bloqueado"
    assert by_id["mauricio-nassau"]["cor"] == "red"
    assert by_id["giratoria"]["status"] == "congestionado"
    # leituraAtual em camelCase
    assert "leituraAtual" in by_id["giratoria"]
    assert "ocupacaoPct" in by_id["giratoria"]["leituraAtual"]


async def test_get_fluxo_horas_6_a_21(client):
    r = await client.get("/api/fluxo", params={"ponteId": "giratoria"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 16  # horas 6..21
    assert data[0]["hora"] == "06:00"
    assert data[-1]["hora"] == "21:00"
    assert all("veiculos" in d for d in data)


async def test_get_alertas_somente_congestionado_ou_bloqueado(client):
    r = await client.get("/api/alertas")
    assert r.status_code == 200
    data = r.json()
    ids = {a["ponteId"]: a for a in data}
    # buarque (normal) não gera alerta; nassau (bloqueado) e giratoria (congestionado) sim
    assert "buarque-de-macedo" not in ids
    assert ids["mauricio-nassau"]["nivel"] == "critico"
    assert ids["giratoria"]["nivel"] == "alto"
    assert all(a["geradoPorIA"] is False for a in data)


async def test_health(client):
    r = await client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["db"] == "up"
