import { BrainCircuit, TrendingUp, Zap, Target } from 'lucide-react';
import { StatCard } from './StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { pontesService } from '../../services/PontesService';
import { usePontesData } from '../hooks/usePontesData';

const PREVISAO_VAZIA = { ponteId: '', geradaEm: new Date(), horizonte: '2h' as const, pontos: [], modeloVersao: '' };

export function AnaliseIA() {
  const previsaoRaw = usePontesData(() => pontesService.getPrevisao('mauricio-nassau'), PREVISAO_VAZIA);
  const eficiencia = usePontesData(() => pontesService.getEficienciaSemanal(), []);

  const previsaoData = previsaoRaw.pontos.map((p, i) => ({
    tempo: p.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    real: i < 3 ? p.veiculosPrevisto - Math.round(Math.random() * 30) : null,
    previsto: p.veiculosPrevisto,
  }));

  const eficienciaData = eficiencia.map(d => ({
    dia: d.dia,
    antes: d.antesMin,
    depois: d.depoisMin,
  }));

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* AI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Acurácia do Modelo"
          value="96.2%"
          subtitle="+1.2% vs. mês passado"
          icon={Target}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Tempo Economizado"
          value="18min"
          subtitle="média por veículo"
          icon={Zap}
          trend="up"
          color="green"
        />
        <StatCard
          title="Otimizações Hoje"
          value="127"
          subtitle="ajustes de semáforo"
          icon={BrainCircuit}
          trend="neutral"
          color="orange"
        />
        <StatCard
          title="Redução CO₂"
          value="12%"
          subtitle="emissões evitadas"
          icon={TrendingUp}
          trend="up"
          color="green"
        />
      </div>

      {/* AI Info Panel */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2">Rede Neural Ativa</h3>
            <p className="text-sm text-muted-foreground mb-3">
              O sistema de IA está processando dados de 15 sensores em tempo real,
              ajustando semáforos e recomendando rotas alternativas para otimizar o fluxo.
            </p>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground">Modelo: </span>
                <span>LSTM + Transformer</span>
              </div>
              <div>
                <span className="text-muted-foreground">Última atualização: </span>
                <span>23s atrás</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confiança: </span>
                <span className="text-green-600">Alta (94%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Previsão */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="mb-4">Previsão de Fluxo (Próximas 2h)</h3>
          <ResponsiveContainer width="100%" height={250} key="analise-previsao">
            <AreaChart data={previsaoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.269 0 0)" />
              <XAxis dataKey="tempo" stroke="oklch(0.708 0 0)" fontSize={12} />
              <YAxis stroke="oklch(0.708 0 0)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Area
                type="monotone"
                dataKey="real"
                name="Real"
                stroke="oklch(0.488 0.243 264.376)"
                fill="oklch(0.488 0.243 264.376)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="previsto"
                name="Previsto"
                stroke="oklch(0.696 0.17 162.48)"
                fill="oklch(0.696 0.17 162.48)"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.488_0.243_264.376)]" />
              <span className="text-muted-foreground">Real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.696_0.17_162.48)]" />
              <span className="text-muted-foreground">Previsto</span>
            </div>
          </div>
        </div>

        {/* Comparação */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="mb-4">Tempo Médio: Antes vs Com IA (min)</h3>
          <ResponsiveContainer width="100%" height={250} key="analise-eficiencia">
            <LineChart data={eficienciaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.269 0 0)" />
              <XAxis dataKey="dia" stroke="oklch(0.708 0 0)" fontSize={12} />
              <YAxis stroke="oklch(0.708 0 0)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Line
                type="monotone"
                dataKey="antes"
                name="Antes da IA"
                stroke="oklch(0.627 0.265 303.9)"
                strokeWidth={2}
                dot={{ fill: 'oklch(0.627 0.265 303.9)' }}
              />
              <Line
                type="monotone"
                dataKey="depois"
                name="Com IA"
                stroke="oklch(0.696 0.17 162.48)"
                strokeWidth={2}
                dot={{ fill: 'oklch(0.696 0.17 162.48)' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.627_0.265_303.9)]" />
              <span className="text-muted-foreground">Antes da IA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.696_0.17_162.48)]" />
              <span className="text-muted-foreground">Com IA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendações da IA */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="mb-4">Recomendações da IA em Tempo Real</h3>
        <div className="space-y-3">
          {[
            {
              tipo: 'Rota Alternativa',
              mensagem: 'Sugerir desvio pela Av. Agamenon Magalhães para veículos em direção à Boa Viagem',
              prioridade: 'alta',
              tempo: '2min atrás'
            },
            {
              tipo: 'Ajuste de Semáforo',
              mensagem: 'Aumentar tempo verde em 15s na Ponte Duarte Coelho (sentido norte)',
              prioridade: 'média',
              tempo: '5min atrás'
            },
            {
              tipo: 'Previsão',
              mensagem: 'Pico de tráfego esperado em 20min na Ponte Boa Vista',
              prioridade: 'média',
              tempo: '8min atrás'
            },
            {
              tipo: 'Otimização',
              mensagem: 'Coordenação de onda verde implementada na Av. Cais do Apolo',
              prioridade: 'baixa',
              tempo: '12min atrás'
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                item.prioridade === 'alta' ? 'bg-red-500' :
                item.prioridade === 'média' ? 'bg-orange-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm">{item.tipo}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.tempo}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {item.mensagem}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
