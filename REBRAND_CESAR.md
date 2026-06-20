# Rebrand CESAR School — SR2_Deck (build_sr2_pptx.py)

**De:** Claudio · **Para:** Bochecha · **Quando:** 2026-06-16
**Decisão do Guga:** rebrand COMPLETO via gerador (não dá pra recolorir formas/stripes pela API do Canva — só você, no script).

## Identidade CESAR School (fontes oficiais, já validadas)
- **Cor institucional principal: laranja `#FF6002`** — extraí do logo vetorial oficial (`marca.svg`).
- **Logo (laranja sobre transparente):**
  - PNG: `https://www.cesar.school/wp-content/themes/alfama/assets/img/logo_cesar.png`
  - SVG: `https://www.cesar.school/wp-content/themes/alfama/assets/img/marca.svg`
- Base **navy mantida** (o Guga aprovou navy + acentos laranja). Logo laranja contrasta bem no navy.

---

## TAREFA 1 — Paleta (o coração do rebrand)
No bloco PALETTE, trocar o acento primário:
```python
BLUE = RGBColor(0xFF, 0x60, 0x02)   # CESAR orange (era 0x5B,0x9B,0xD5)
```
`BLUE` é o acento primário (kickers, stripes de topo dos cards, bordas, números de stat, setas →, labels). Trocar essa constante já vira tudo isso pra laranja CESAR.

**Decisão de design que é sua (me diga o que achar melhor):** as secundárias semânticas — `TEAL` (B2B), `GOLD` (cenário adverso), `GREEN` (dado vivo), `YELLOW` (diferido) — mantemos como estão (paleta funcional) ou harmonizamos? Minha sugestão: **manter** (dão leitura semântica e contraste com o laranja). Mas é seu olho de design — decide.

## TAREFA 2 — Logo CESAR School
Baixar o logo e colocar nos slides:
```bash
curl -sL "https://www.cesar.school/wp-content/themes/alfama/assets/img/logo_cesar.png" -o /tmp/sr2_slides/cesar_logo.png
```
- **Slide 1 (capa)** e **Slide 8 (fechamento):** logo pequeno na **COLUNA ESQUERDA** (ex.: topo perto do kicker, ou rodapé esquerdo). ⚠️ NÃO colocar na metade direita — ela é reservada pra foto que eu re-insiro no Canva depois.
- **Slides de conteúdo (3–7):** opcional, um mark discreto num canto (perto da rule line). Seu critério — sutil.
- Use `pic(sl, "/tmp/sr2_slides/cesar_logo.png", x, y, w, h)`. Mantém a proporção do PNG.

## TAREFA 3 — Rebake do polimento que fizemos no Canva (pra não perder no reimport)

**3a. Títulos de seção → 36pt** (Guga unificou). Trocar o `size`:
- s2 "A Tensão": 40 → **36**
- s3 "A Aposta": 40 → **36**
- s4 "O Negócio": 34 → **36**
- s5 "O Sistema": 32 → **36**
- s6 "A Prova": 32 → **36**

**3b. Textos enxutos** (substituições exatas):
- s3 (build_s3, txm esquerdo):
  - "Não é construir mais um app de trânsito." → "Não é mais um app de trânsito."
  - "É construir a camada que falta:" → "É a camada que falta:"
  - "uma plataforma que integra, reconcilia e entrega" → "integra, reconcilia e entrega"
  - "R$ 7,4 bilhões movimentados em 2025." → "R$ 7,4 bi movimentados em 2025."
- s3 (caixa SR2):
  - "IA preditiva: declarada e diferida — liga quando os silos estiverem abertos e houver histórico para treinar." → "IA preditiva: declarada e diferida — liga quando os silos abrirem e houver histórico."
- s5 (LAYERS, bodies):
  - Camada 1: "Ingestão do dado bruto via APIs públicas: CTTU Dados Abertos, Centro de Operações do Recife, Waze for Cities.\n\nDois sensores CTTU ativos no Bairro do Recife: FS002REC e FS003REC." → "Dado bruto via APIs públicas: CTTU Dados Abertos, Centro de Operações do Recife, Waze for Cities.\n\nDois sensores CTTU ativos: FS002REC · FS003REC."
  - Camada 2: "Algoritmo resolve conflitos entre fontes: normalização de timestamps, detecção de outliers, score de confiabilidade por fonte e por janela temporal." → "Resolve conflitos entre fontes: normaliza timestamps, detecta outliers, pontua confiabilidade por fonte e janela temporal."
  - Camada 3: "Supervisão humana sobre anomalias e alertas. Decisão editorial antes da publicação. Garante qualidade sem depender de IA opaca." → "Supervisão humana de anomalias e alertas. Decisão editorial antes de publicar. Qualidade sem depender de IA opaca."
  - Camada 4: "Interface pública para cidadãos e gestores. API aberta para licenciamento B2B.\n\nIA preditiva (15–60 min): diferida para Fase 2." → "Interface pública para cidadãos e gestores. API aberta para licenciamento B2B.\n\nIA preditiva (15–60 min): Fase 2."

**3c. Contraste dos rodapés** (estavam ilegíveis em GHOST). Criar `FOOT = RGBColor(0x9D, 0xB0, 0xCC)` e usar:
- s2: o txm de baixo ("O dado existe… / Está preso em silos…") → cor FOOT (era GHOST)
- s5: o txb itálico de baixo ("IA preditiva declarada e diferida… Evidência") → cor FOOT (era GHOST)

**3d. Alinhamento (insets de texto consistentes nas colunas):**
- s3 coluna direita: o texto dos 3 cards deve ter o MESMO inset. Hoje: `_pivot` usa `x+Inches(0.13)`, SR2 usa `rx+Inches(0.14)`, Benchmark usa `rx+Inches(0.18)`. Padroniza TODOS em **0.14**.
- s4: label "I³" em `LM+Inches(0.18)` → **0.20** (alinha com o texto dos cards, que é `x+0.20`).
- s6: caixa Break-even, texto em `rx+Inches(0.18)` → **0.12** (alinha com os boxes de cenário, que usam `sx+0.12`).

## TAREFA 4 — Rebuild + verificação
```bash
python3 /tmp/build_sr2_pptx.py
```
Saída esperada: `/home/gugagames/Downloads/Faculdade/MINTE2-Pontes/SR2_Deck.pptx`.
Verifica antes de me devolver: confirma que o arquivo salvou (tamanho/mtime) e que os textos novos entraram (ex.: `python3 -c "from pptx import Presentation; p=Presentation('...SR2_Deck.pptx'); print('\n'.join(s.text_frame.text for sl in p.slides for s in sl.shapes if s.has_text_frame))" | grep -i "abrirem\|R\$ 7,4 bi\|36"`). E que o logo foi inserido (conta de imagens por slide).

## Depois (eu faço)
- Guga reimporta o .pptx no Canva (gera design novo, já branded).
- Eu re-insiro as 3 fotos-fantasma (slides 1/2/8) no Canva — os assets já existem na conta (Ponte Giratória / vista aérea), reuso por asset_id.

## Bônus (se souber): TIPOGRAFIA
O brandbook da CESAR tá atrás de login (cesar.org.br). Se você souber a fonte oficial da marca E o Canva tiver ela, a gente troca; senão mantém Playfair Display + Open Sans. Me fala se souber.

**Me responde curto quando terminar (ou se travar em algo).** Valeu!

---

## ✅ VERIFICADO (Claudio, 2026-06-17)

Auditei o .pptx gerado — tudo verde:
- Paleta `#FF6002` aplicada em todos os acentos primários
- Logo CESAR nos slides 1 e 8 (coluna esquerda, proporção ok)
- 5 títulos de seção em 36pt
- 7 textos enxutos confirmados (s3 left × 4, s3 TO box, s5 camadas selecionadas)
- Insets de alinhamento corrigidos (s3/s4/s6)
- `FOOT` em rodapés de s2 e s5

**Slide 2 — mapa:** `SR2_Deck.pdf` ausente → placeholder. Cobrirei com a foto aérea no Canva (mesmo fluxo das fotos-fantasma dos slides 1/8).

**Próximo:** Guga reimporta o .pptx no Canva → verificação visual do laranja/logo → re-inserção das fotos.

---

## ✅ VERIFICADO (Claudio, 2026-06-17)

Auditei o `.pptx` gerado (não confiei só no "pronto"):
- Arquivo fresco (00:04), 50 KB.
- `BLUE = RGBColor(0xFF, 0x60, 0x02)` ✓ no script.
- 7 textos enxutos: TODOS presentes ✓ (incl. "silos abrirem", "R$ 7,4 bi", "FS002REC ·", "Fase 2").
- Logo: slide 1 = 1 imagem, slide 8 = 1 imagem ✓.
- Títulos: 5×36.0pt ✓.

Não tenho LibreOffice aqui pra pré-renderizar — vou conferir o laranja/logo visualmente no Canva após o Guga reimportar. Slide 2 ficou com placeholder do mapa (PDF sumiu) — sem problema, eu cubro com a foto aérea fantasma no Canva. Mandou bem, valeu!
