import { Car, Clock, AlertTriangle, Info } from 'lucide-react';
import { StatCard } from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { pontesService } from '../../services/PontesService';
import { usePontesData } from '../hooks/usePontesData';

export function Dashboard() {
  // Polling de 4s: reflete o feed ao vivo (simulador de tempo real da CTTU).
  const LIVE_MS = 4000;
  const fluxoData = usePontesData(() => pontesService.getFluxoPorHora(), [], LIVE_MS);
  const statusPontes = usePontesData(() => pontesService.getStatusPontes(), [], LIVE_MS);
  const alertas = usePontesData(() => pontesService.getAlertasAtivos(), [], LIVE_MS);

  const pontesData = statusPontes.map(s => ({
    ponte: s.ponte.nome,
    ocupacao: s.leituraAtual.ocupacaoPct,
  }));
  // getAlertasAtivos pode trazer resolvidos recentes; aqui contamos só os ativos.
  const alertasAtivos = alertas.filter(a => a.resolvidoEm === null);
  const congestionamentos = alertasAtivos.filter(a => a.tipo === 'congestionamento').length;

  // Métricas derivadas do serviço (antes: strings fixas)
  const fluxoTotal = statusPontes.reduce((s, p) => s + p.leituraAtual.veiculosPorHora, 0);
  const fluxoTotalLabel = fluxoTotal >= 1000 ? `${(fluxoTotal / 1000).toFixed(1)}k` : String(fluxoTotal);
  const tempoMedio = statusPontes.length
    ? Math.round(statusPontes.reduce((s, p) => s + p.leituraAtual.tempoDeTravessia, 0) / statusPontes.length)
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Fluxo Total"
          value={fluxoTotalLabel}
          subtitle="veículos/hora (soma das pontes)"
          icon={Car}
          trend="neutral"
          color="blue"
        />
        <StatCard
          title="Tempo Médio"
          value={`${tempoMedio}min`}
          subtitle="travessia média"
          icon={Clock}
          trend="down"
          color="green"
        />
        <StatCard
          title="Alertas Ativos"
          value={String(alertasAtivos.length)}
          subtitle={`${congestionamentos} congestionamentos`}
          icon={AlertTriangle}
          trend="up"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fluxo por Hora */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="mb-4">Fluxo de Veículos por Hora</h3>
          <ResponsiveContainer width="100%" height={250} key="dashboard-fluxo">
            <LineChart data={fluxoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.269 0 0)" />
              <XAxis dataKey="hora" stroke="oklch(0.708 0 0)" fontSize={12} />
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
                dataKey="veiculos"
                name="Veículos"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: 'var(--chart-1)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ocupação por Ponte */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="mb-4">Ocupação por Ponte (%)</h3>
          <ResponsiveContainer width="100%" height={250} key="dashboard-pontes">
            <BarChart data={pontesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.269 0 0)" />
              <XAxis
                dataKey="ponte"
                stroke="oklch(0.708 0 0)"
                fontSize={11}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="oklch(0.708 0 0)" fontSize={12} />
              <Tooltip
                cursor={{ fill: 'var(--accent)' }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar
                dataKey="ocupacao"
                name="Ocupação"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status das Pontes */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="mb-4">Status das Pontes em Tempo Real</h3>
        <div className="space-y-3">
          {statusPontes.map((s) => {
            const ponte = { nome: s.ponte.nomeCompleto, status: s.status, fluxo: s.leituraAtual.ocupacaoPct, cor: s.cor };
            return (
            <div key={ponte.nome} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-3 h-3 rounded-full ${
                  ponte.cor === 'green' ? 'bg-green-500' :
                  ponte.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="text-sm sm:text-base">{ponte.nome}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {ponte.status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        ponte.cor === 'green' ? 'bg-green-500' :
                        ponte.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${ponte.fluxo}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm w-10 text-right">{ponte.fluxo}%</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Rótulo de transparência de dados */}
      <div className="flex items-start gap-2 p-3 rounded-lg border border-border/60 bg-muted/30 text-xs text-muted-foreground">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
        <span>
          <strong className="text-foreground/70">Fonte dos dados:</strong>{' '}
          CTTU Dados Abertos (ODbL) — sensores{' '}
          <strong className="font-mono">FS002REC</strong> (Rua Madre de Deus) e{' '}
          <strong className="font-mono">FS003REC</strong> (Av. Marquês de Olinda), Bairro do Recife.
          Dado real histórico (2018); ocupação por ponte derivada por threshold de capacidade.
          Granularidade exata por-ponte disponível via TrafGO (acesso B2G pendente).
        </span>
      </div>
    </div>
  );
}
