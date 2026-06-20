"""Testa as funções puras de agregação CTTU e derivação de status."""
from datetime import date

from app.services import cttu
from app.services.alertas import StatusAtual, decidir, nivel_por_status
from app.services.compute import derive_status, status_cor
from app.services.ingest_math import build_leituras


def test_total_count_soma_todas_as_faixas():
    rec = {"qtd_0a10km": "2", "qtd_11a20km": "3", "qtd_21a30km": "5"}
    assert cttu.total_count(rec) == 10


def test_total_count_ignora_campos_ausentes_ou_invalidos():
    rec = {"qtd_0a10km": "4", "qtd_11a20km": None, "qtd_21a30km": "x"}
    assert cttu.total_count(rec) == 4


def test_avg_speed_media_ponderada():
    # 10 veículos a 5 km/h (0a10) + 10 a 15.5 (11a20) -> média 10.25
    rec = {"qtd_0a10km": "10", "qtd_11a20km": "10"}
    assert cttu.avg_speed(rec) == 10.25


def test_avg_speed_zero_quando_sem_contagem():
    assert cttu.avg_speed({}) == 0.0


def test_aggregate_agrupa_por_hora():
    records = [
        {"hora": "8", "qtd_0a10km": "10"},
        {"hora": "8", "qtd_11a20km": "10"},
        {"hora": "9", "qtd_41a50km": "4"},
    ]
    agg = cttu.aggregate(records)
    assert set(agg.keys()) == {8, 9}
    assert agg[8]["veiculos"] == 20
    assert agg[9]["veiculos"] == 4


def test_build_leituras_calibra_e_deriva():
    # Giratória: cap 600, cap_ref 180 -> fator 3.333...
    by_hora = {8: {"veiculos": 100.0, "velocidade": 30.0}}
    rows = build_leituras("giratoria", by_hora, date(2018, 8, 28))
    assert len(rows) == 1
    ponte_id, ts, vph, occ, vel, trav, fonte = rows[0]
    assert ponte_id == "giratoria"
    assert ts.hour == 8
    assert vph == 333  # round(100 * 600/180)
    assert occ == 56   # min(100, round(333/600*100))
    assert fonte == "cttu"


def test_build_leituras_teto_de_ocupacao():
    # Fluxo muito acima da capacidade -> ocupação trava em 100 (bloqueado)
    by_hora = {18: {"veiculos": 1000.0, "velocidade": 12.0}}
    rows = build_leituras("giratoria", by_hora, date(2018, 8, 28))
    occ = rows[0][3]
    assert occ == 100


def test_derive_status_thresholds():
    assert derive_status(40) == "normal"
    assert derive_status(50) == "atencao"
    assert derive_status(75) == "congestionado"
    assert derive_status(90) == "bloqueado"


def test_status_cor():
    assert status_cor("normal") == "green"
    assert status_cor("atencao") == "orange"
    assert status_cor("congestionado") == "red"
    assert status_cor("bloqueado") == "red"


def test_decidir_abre_alerta_quando_congestiona_sem_ativo():
    statuses = [StatusAtual("giratoria", "Giratória", "congestionado", 80)]
    criar, atualizar, resolver = decidir(statuses, ativos={})
    assert [s.ponte_id for s in criar] == ["giratoria"]
    assert atualizar == [] and resolver == []


def test_decidir_nao_duplica_alerta_de_mesmo_nivel():
    statuses = [StatusAtual("giratoria", "Giratória", "bloqueado", 95)]
    criar, atualizar, resolver = decidir(statuses, ativos={"giratoria": "critico"})
    assert criar == [] and atualizar == [] and resolver == []


def test_decidir_escala_quando_nivel_muda():
    statuses = [StatusAtual("giratoria", "Giratória", "bloqueado", 95)]
    criar, atualizar, resolver = decidir(statuses, ativos={"giratoria": "alto"})
    assert criar == []
    assert [s.ponte_id for s in atualizar] == ["giratoria"]
    assert resolver == []


def test_decidir_resolve_quando_normaliza():
    statuses = [StatusAtual("giratoria", "Giratória", "normal", 30)]
    criar, atualizar, resolver = decidir(statuses, ativos={"giratoria": "alto"})
    assert criar == [] and atualizar == []
    assert resolver == ["giratoria"]


def test_nivel_por_status():
    assert nivel_por_status("atencao") == "medio"
    assert nivel_por_status("congestionado") == "alto"
    assert nivel_por_status("bloqueado") == "critico"
    assert nivel_por_status("normal") is None
