import { Lightbulb, XCircle, RefreshCw, LayoutDashboard, BrainCircuit, ShieldCheck } from 'lucide-react';

const FASES = [
  {
    numero: '01',
    icone: Lightbulb,
    titulo: 'Problema Identificado',
    periodo: 'Semana 1',
    cor: 'blue',
    descricao: 'As 3 pontes de acesso ao Bairro do Recife (Ilha do Recife) concentram todo o fluxo de entrada e saída. Congestionamentos diários afetam trabalhadores, logística e emergências.',
    destaque: null,
  },
  {
    numero: '02',
    icone: XCircle,
    titulo: 'Primeira Ideia — Bloqueada',
    periodo: 'Semana 1–2',
    cor: 'red',
    descricao: 'A solução inicial era semáforos inteligentes com sensores físicos nas pontes. Mas as pontes são tombadas pelo IPHAN — qualquer intervenção física exige aprovação patrimonial, tornando a solução inviável no prazo do projeto.',
    destaque: 'Restrição descoberta: IPHAN bloqueia infraestrutura física.',
  },
  {
    numero: '03',
    icone: RefreshCw,
    titulo: 'O Reframe',
    periodo: 'Semana 2',
    cor: 'orange',
    descricao: 'Em vez de mudar a infraestrutura, mudamos o problema. O gargalo não é físico — é informacional. Gestores, motoristas e operadores logísticos tomam decisões sem dados. A solução: tornar o fluxo legível.',
    destaque: '"O problema não é a ponte. É a falta de informação sobre ela."',
  },
  {
    numero: '04',
    icone: LayoutDashboard,
    titulo: 'Dashboard Público',
    periodo: 'Semana 2–3',
    cor: 'green',
    descricao: 'Um dashboard de dados abertos em tempo real: status das 3 pontes, fluxo por hora, alertas de incidentes. Qualquer app pode consumir via API pública. CTTU, Consórcio e Porto Digital como primeiros parceiros B2G.',
    destaque: null,
  },
  {
    numero: '05',
    icone: BrainCircuit,
    titulo: 'IA Preditiva',
    periodo: 'Semana 3–4',
    cor: 'purple',
    descricao: 'Adicionamos previsão de tráfego com LSTM + Transformer: o sistema aprende os padrões de rush hour e antecipa congestionamentos em 2h, 4h e 6h. Gestores planejam antes do problema acontecer.',
    destaque: 'Acurácia atual do modelo simulado: 96.2%',
  },
  {
    numero: '06',
    icone: ShieldCheck,
    titulo: 'Sistema Sociotécnico Completo',
    periodo: 'Hoje',
    cor: 'teal',
    descricao: '15 User Stories, 3 personas, Digital Twin para simulação pré-obra, log de auditoria criptográfico (IA vs. Humano) e governança algorítmica. O que começou como "semáforo inteligente" virou infraestrutura de decisão para a cidade.',
    destaque: 'De intervenção física para sistema de informação urbana.',
  },
];

const CORES: Record<string, { bg: string; border: string; text: string; num: string }> = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-600',   num: 'bg-blue-500/20 text-blue-700' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-600',    num: 'bg-red-500/20 text-red-700' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600', num: 'bg-orange-500/20 text-orange-700' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-600',  num: 'bg-green-500/20 text-green-700' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-600', num: 'bg-purple-500/20 text-purple-700' },
  teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   text: 'text-teal-600',   num: 'bg-teal-500/20 text-teal-700' },
};

export function EvolucaoProjeto() {
  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h2 className="text-2xl sm:text-3xl font-semibold">Evolução do Projeto</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          De uma ideia bloqueada por restrições patrimoniais a um sistema de informação urbana
          com IA preditiva e governança algorítmica.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

        <div className="space-y-4">
          {FASES.map((fase, index) => {
            const c = CORES[fase.cor];
            const Icone = fase.icone;
            const isLast = index === FASES.length - 1;

            return (
              <div key={fase.numero} className="relative flex gap-4 sm:gap-6">
                {/* Ícone na linha do tempo */}
                <div className={`
                  relative z-10 flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full
                  flex items-center justify-center border-2
                  ${c.bg} ${c.border}
                  ${isLast ? 'ring-2 ring-offset-2 ring-teal-500/50' : ''}
                `}>
                  <Icone className={`w-5 h-5 sm:w-6 sm:h-6 ${c.text}`} />
                </div>

                {/* Conteúdo */}
                <div className={`
                  flex-1 rounded-lg border p-4 sm:p-5 mb-2
                  ${c.bg} ${c.border}
                `}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${c.num}`}>
                        {fase.numero}
                      </span>
                      <h3 className="font-semibold text-sm sm:text-base">{fase.titulo}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {fase.periodo}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fase.descricao}
                  </p>

                  {fase.destaque && (
                    <div className={`mt-3 text-xs sm:text-sm font-medium px-3 py-2 rounded-md border ${c.bg} ${c.border} ${c.text}`}>
                      {fase.destaque}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo final */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold mb-3">O que aprendemos no caminho</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-orange-600">Restrição → Inovação</div>
            <div className="text-muted-foreground">
              O IPHAN que bloqueou os semáforos nos forçou a resolver um problema mais profundo:
              a invisibilidade do dado de tráfego.
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-blue-600">Físico → Informacional</div>
            <div className="text-muted-foreground">
              Mudar pontes custa anos e recursos. Mudar como as pessoas decidem custa
              uma API pública e um dashboard.
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-teal-600">MVP → Plataforma</div>
            <div className="text-muted-foreground">
              O que começa como status de pontes pode evoluir para infraestrutura de
              decisão para toda a mobilidade urbana do Recife.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
