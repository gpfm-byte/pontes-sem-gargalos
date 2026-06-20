# REDESIGN COMPLETO na marca CESAR — SR2_Deck (build_sr2_pptx.py)

**De:** Claudio · **Para:** Bochecha · **Quando:** 2026-06-17
**Decisão do Guga:** reformular COMPLETAMENTE o design na identidade CESAR. Tema: **editorial misto** (laranja + creme + preto). Isto é um **refactor visual grande** do gerador — o conteúdo e os números NÃO mudam, só o sistema visual.

Fonte da verdade da marca: `~/Downloads/cesar-brandguideline_2025_compressed.pdf` (já li). Resumo abaixo.

---

## SISTEMA CESAR (oficial)
- **Tipografia: `DM Sans`** (Canva tem). Pesos: Light, Regular, Medium, Bold, Extrabold, **Black**. Display = Black; títulos = Extrabold; corpo = Regular/Medium. **Trocar SERIF e SANS → "DM Sans"** (Playfair sai de cena). Display usa Black.
- **Paleta:** laranja `#FF6002` · quase-preto `#161616` · creme `#FFFEEE` · branco `#FFFFFF` · rust `#DD4012` · cinza-escuro `#3F3F3F` · azul-acinzentado `#818B9D`. **SEM NAVY.**
- **Tom:** moderno, sóbrio, disciplinado.
- **Motivo:** círculo / meio-círculo / retângulo arredondado / "círculo duplo"; **pílulas laranja** atrás de palavras-chave; ícones/bullets geométricos; fotos em círculos/retângulos arredondados.
- **Logo:** mono conforme o fundo (claro→logo escuro/laranja; escuro/laranja→logo creme). Mín. 14px.

---

## TAREFA 1 — Tipografia
`SERIF = "DM Sans"` e `SANS = "DM Sans"`. Aplicar peso por papel via `bold`/weight:
- Hero ("807", "Temos um Negócio"): **Black** (use bold=True; se der, peso 900).
- Títulos de seção: **Extrabold/Bold**, 36pt (mantém unificado).
- Kicker ("Artefato I · ..."): **Bold**, 7–8pt, laranja. (Bônus: estilo "Artefato I_" com underscore, é tell da marca.)
- Card title: **Bold**, 14–20pt. Corpo: **Regular** (tamanhos atuais). Stat numbers: **Black/Extrabold**, laranja.

## TAREFA 2 — Sistema de cor por slide (o coração)
Refatorar para **tema por slide** (bg + texto + subtexto + acento). Sugestão: um dict `THEME` por builder.

| Slide | Fundo | Texto | Subtexto | Acento |
|---|---|---|---|---|
| 1 Capa | **#FF6002** | #FFFEEE | #FFFEEE | #161616 / #FFFFFF |
| 2 A Tensão | **#FFFEEE** | #161616 | #3F3F3F | #FF6002 |
| 3 A Aposta | **#FFFEEE** | #161616 | #3F3F3F | #FF6002 |
| 4 O Negócio | **#FFFEEE** | #161616 | #3F3F3F | #FF6002 |
| 5 O Sistema | **#FFFEEE** | #161616 | #3F3F3F | #FF6002 |
| 6 A Prova | **#FFFEEE** | #161616 | #3F3F3F | #FF6002 |
| 7 Coerência | **#161616** | #FFFEEE | #818B9D | #FF6002 |
| 8 Fechamento | **#FF6002** | #FFFEEE | #FFFEEE | #161616 |

**Remapeamento das cores semânticas antigas** (a marca não tem azul/teal/verde/dourado/amarelo):
- BLUE (acento primário) → **#FF6002** (já está).
- TEAL (B2B) → **#DD4012** (rust = 2º canal).
- GOLD (cenário adverso) → **#DD4012** (warm warning) ou #3F3F3F.
- GREEN ("dado vivo") → **#FF6002**. YELLOW ("diferida") → **#818B9D** (cinza = pendente).
- DIM/FAINT/GHOST: nos slides creme = #3F3F3F (corpo) / #818B9D (secundário); nos slides preto/laranja = creme/branco com leve transparência.

**Cards nos slides creme:** fundo branco #FFFFFF, stripe/borda laranja #FF6002 (ou rust no B2B). Rules finas em #818B9D. Nos slides preto/laranja, cards em tom sobre o fundo com borda creme/laranja.

## TAREFA 3 — Motivos da marca (prioridade)
- **P2 (feel):** trocar bullets quadrados por **círculo ●** ou **meio-círculo ◐** laranja. **Pílula laranja** (retângulo arredondado) atrás do número-chave de cada slide OU atrás do kicker. Rules laranja finas.
- **P3 (flourish):** **círculos/meios-círculos** laranja decorativos em cantos; "**círculo duplo**" (peanut) como elemento no slide 7 (preto); blob laranja com gradiente na capa/fechamento se quiser. Não exagere — tom sóbrio.

## TAREFA 4 — Fotos (embutir os arquivos reais)
Arquivos no disco:
- `/home/gugagames/Downloads/PONTE GIRATORIA.jpg`
- `/home/gugagames/Downloads/Recife_-_Vista_aérea_a_partir_do_bairro_do_Recife.jpg`

Tratamento na linguagem da marca: **círculo** ou **retângulo arredondado**. Sugestão:
- Capa (laranja): "807" domina; foto Ponte Giratória num **círculo** à direita (ou omitir p/ capa tipográfica limpa — seu critério).
- Slide 2 (creme): vista aérea num **círculo/retângulo arredondado** à direita.
- Slide 8 (laranja): Ponte Giratória num **círculo** à direita (bookend).
Se mascarar em círculo for difícil no python-pptx, usa **retângulo arredondado** (a marca também usa). Sem navy/overlay azul.

## TAREFA 5 — Logo mono por fundo
- Slides creme: logo **laranja** (`logo_cesar.png` que você já baixou) ou preto.
- Slides laranja/preto (1, 7, 8): logo **creme/branco** — recolore o `marca.svg` (fill #FF6002 → #FFFEEE) e rasteriza (rsvg-convert/ImageMagick), ou usa versão mono branca. Mín. 14px (estamos ~90–100px, ok).

## MANTER
Todo o **conteúdo e o polimento** atuais (textos enxutos, números, alinhamento, títulos 36pt). Só o **sistema visual** muda.

## BUILD + VERIFICAÇÃO
`python3 /tmp/build_sr2_pptx.py` → `~/Downloads/Faculdade/MINTE2-Pontes/SR2_Deck.pptx`.
Antes de devolver, confirma: arquivo salvou; fontes = DM Sans (checa `r.font.name`); nº de imagens (logo + fotos) por slide; e que os textos/números seguem lá. Me responde curto com um resumo do que ficou (e o que NÃO deu, ex.: máscara circular).

## DEPOIS (eu faço)
Guga reimporta o .pptx → eu verifico visualmente no Canva (thumbnails de todos os 8) e ajusto detalhes finos se precisar.

**Tarefa grande — capricha na direção de arte. Qualquer trava, me chama.** Valeu!

---

## ✅ VERIFICADO (Claudio, 2026-06-17 07:37)

Auditei o `.pptx` regerado (3.9 MB, build 07:30). Tudo verde e batendo com a direção:
- **Fundos:** s1 #FF6002 · s2–6 #FFFEEE · s7 #161616 · s8 #FF6002 ✓ (ritmo editorial exato).
- **Tipografia:** 164 runs, **100% DM Sans** (zero Playfair/Open Sans) ✓.
- **Imagens:** fotos reais nos slides 1/2/8 + logo em todos ✓.
- **Conteúdo:** 807, R$ 7,4 bi, FS002REC, "silos abrirem", "Temos um", Break-even — preservados ✓.

Mandou muito bem mesmo com o sleep do PC + limite de sessão atravessando no meio (cota resetou 4:10am e você retomou). Verificação **visual** (cores de texto/motivos/fotos) eu faço no Canva após o Guga reimportar. Próximo: Guga reimporta → Claudio verifica thumbnails dos 8.
