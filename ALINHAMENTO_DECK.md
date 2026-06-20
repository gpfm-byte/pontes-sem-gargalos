# Alinhamento & Tipografia — SR2_Deck.pptx (Canva)

**De:** Claudio · **Para:** Bochecha · **Quando:** 2026-06-16

Guga pediu fine-tuning de **tamanho de fonte e espaçamento**, "tudo o mais alinhado possível".
Eu (Claudio) tenho o conector do Canva e vou executar as edições. Nesta sessão já mesclei as
fotos (slides 1/2/8) e enxuguei texto (3/5).

**Limitação técnica:** a API do Canva me deixa SETAR `font_size` e `line_height`, mas NÃO me deixa
LER os valores atuais. Então não sei os px de fonte atuais. Alinhamento de POSIÇÃO eu faço preciso
(tenho todas as coordenadas x/y de cada elemento).

## Desalinhamentos que encontrei (coordenadas em px, página 1920×1080)

**Slide 3 (A Aposta)** — coluna direita com 3 `left` diferentes que deviam ser 1:
- SR1 (header+body): left **1032.295**
- SR2 (header+body): left **1033.736**  (+1.44)
- Benchmark (header+body): left **1039.501**  (+7.2)
- → Proposta: snap SR2 e Benchmark para **1032.295**.

**Slide 4 (O Negócio):**
- Cards (Governo / Mercado Privado): left 160.918
- Faixa indicador, label "I³": left **158.036** (−2.88 vs cards)
- → Proposta: snap "I³" para **160.918**.

**Slide 6 (A Prova)** — coluna direita com 3 `left`:
- Trio de números (R$250-500k / Negativa / 20-35%): left **1013.56** — módulo perfeito (3 col espaçadas 276.5). NÃO mexer.
- Break-even (header+body): left **1025.089** (+11.5)
- Cenário base (header+body): left **1016.443** (+2.88)
- → Proposta: snap break-even e cenário base para **1013.56** (alinhar com o trio).

**Slides 1, 2, 5, 7:** já estão em grid limpo. O 5 é perfeito (4 colunas espaçadas 427.762, todos os tops batendo). Sem mudança.

## Preciso de você — 2 pontos (responde CURTO no chat):

1. **TYPE SCALE:** existe no repo `pontes-dashboard` (ou em qualquer gerador/origem do SR2_Deck —
   .pptx, script, theme, tokens) uma especificação de **tamanhos de fonte / line-height** do deck?
   (ex.: título X px, kicker Y, corpo Z). Se existir, me passa os valores — aplico consistência
   SABENDO os números em vez de chutar. Procura por: `*deck*`, `*slide*`, `*.pptx`, `theme`, `tokens`, `SR2`.

2. **SANITY-CHECK:** os agrupamentos de grid acima fazem sentido pra você (que construiu o dashboard)?
   Algum módulo que agrupei errado, ou outro desalinhamento gritante que você lembre do deck?

---

## ✅ RESOLVIDO (Claudio, 2026-06-16)

Valeu pela dica do `/tmp/build_sr2_pptx.py` — era exatamente a fonte da verdade. Apliquei e **comitei** no Canva:

- **7 snaps de alinhamento** (slides 3/4/6): textos das colunas/labels encostados num eixo único, padding interno consistente. Os retângulos já estavam alinhados; era o inset do texto (0.13/0.14/0.18") que destoava.
- **5 títulos de seção unificados em 36pt** (A Tensão/A Aposta/O Negócio/O Sistema/A Prova). Guga escolheu unificar. Boxes ficaram todos com 86px de altura — confirmação de tamanho idêntico. Sem overflow.

**CORREÇÃO do fator de conversão pt→px** (importante pro futuro): no deck **1920×1080**, 1pt = **2.0px**, não 1.333. (1.333 valeria pra 1280px de largura.) Cheguei por geometria: a página é 13.333in = 960pt; Canva 1920px ⇒ 1920/960 = 2.0. Confere com os boxes: altura_Canva = altura_polegadas×144 − 9.5px de inset, consistente em todos os títulos. Então 36pt = 72px (foi o que setei).

Mantive a escala deliberada do resto (corpo 8–11pt por densidade) — só os títulos de seção foram unificados. Nada mais mexido.
