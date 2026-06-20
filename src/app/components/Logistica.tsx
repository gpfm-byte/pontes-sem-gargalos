import { Truck, Clock, AlertCircle, TrendingUp, Navigation2, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// US-01: Previsão de Tráfego Antecipada
const previsaoFluxo = [
  { hora: 'Agora', agamenon: 65, avNorte: 58, caxanga: 71, boaViagem: 82 },
  { hora: '+2h', agamenon: 78, avNorte: 72, caxanga: 85, boaViagem: 92 },
  { hora: '+4h', agamenon: 92, avNorte: 88, caxanga: 95, boaViagem: 75 },
  { hora: '+6h', agamenon: 68, avNorte: 62, caxanga: 71, boaViagem: 58 },
];

// US-03: Análise de Padrões Históricos
const padraoSemanal = [
  { dia: 'Seg', manha: 85, tarde: 72, noite: 68 },
  { dia: 'Ter', manha: 88, tarde: 75, noite: 71 },
  { dia: 'Qua', manha: 82, tarde: 78, noite: 69 },
  { dia: 'Qui', manha: 90, tarde: 82, noite: 74 },
  { dia: 'Sex', manha: 95, tarde: 88, noite: 79 },
  { dia: 'Sab', manha: 42, tarde: 58, noite: 65 },
  { dia: 'Dom', manha: 28, tarde: 45, noite: 52 },
];

export function Logistica() {
  const getFluxoStatus = (valor: number) => {
    if (valor < 60) return { label: 'Livre', cor: 'green' };
    if (valor < 80) return { label: 'Moderado', cor: 'orange' };
    return { label: 'Intenso', cor: 'red' };
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Header Persona */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl mb-2">Prestador de Serviço Logístico</h2>
            <p className="text-sm text-muted-foreground">
              Planeje suas rotas de entrega com previsões de IA e alertas em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* US-01: Previsão de Tráfego (2h, 4h, 6h) */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3>US-01 | Previsão de Tráfego Antecipada</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Visualize a previsão do tráfego com até 6 horas de antecedência nas principais artérias
        </p>

        <ResponsiveContainer width="100%" height={250} key="logistica-previsao">
          <LineChart data={previsaoFluxo}>
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
            <Line type="monotone" dataKey="agamenon" name="Av. Agamenon" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="avNorte" name="Av. Norte" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="caxanga" name="Av. Caxangá" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="boaViagem" name="Av. Boa Viagem" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {[
            { via: 'Av. Agamenon Magalhães', atual: 65, em2h: 78 },
            { via: 'Av. Norte', atual: 58, em2h: 72 },
            { via: 'Av. Caxangá', atual: 71, em2h: 85 },
            { via: 'Av. Boa Viagem', atual: 82, em2h: 92 },
          ].map((via) => {
            const statusAtual = getFluxoStatus(via.atual);
            const status2h = getFluxoStatus(via.em2h);

            return (
              <div key={via.via} className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2 truncate">{via.via}</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Agora</span>
                      <span className={`px-2 py-0.5 rounded ${
                        statusAtual.cor === 'green' ? 'bg-green-500/20 text-green-600' :
                        statusAtual.cor === 'orange' ? 'bg-orange-500/20 text-orange-600' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {statusAtual.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          statusAtual.cor === 'green' ? 'bg-green-500' :
                          statusAtual.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${via.atual}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Em 2h</span>
                      <span className={`px-2 py-0.5 rounded ${
                        status2h.cor === 'green' ? 'bg-green-500/20 text-green-600' :
                        status2h.cor === 'orange' ? 'bg-orange-500/20 text-orange-600' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {status2h.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          status2h.cor === 'green' ? 'bg-green-500' :
                          status2h.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${via.em2h}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* US-02: Alertas de Incidentes em Tempo Real */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h3>US-02 | Alertas de Incidentes em Tempo Real</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Receba notificações imediatas sobre sinistros, alagamentos ou protestos ({"< 2min"} pós-detecção)
        </p>

        <div className="space-y-3">
          {[
            {
              tipo: 'CRÍTICO',
              titulo: 'Acidente com vítimas - Av. Agamenon',
              descricao: 'Colisão entre 3 veículos bloqueando 2 faixas (sentido Boa Viagem)',
              local: 'Av. Agamenon Magalhães, altura do Shopping Recife',
              tempo: '1min atrás',
              impacto: '+18min no trajeto',
              cor: 'red'
            },
            {
              tipo: 'ALTO',
              titulo: 'Alagamento - Av. Norte',
              descricao: 'Chuva intensa causou alagamento em 1 faixa da via',
              local: 'Av. Norte, próximo ao Terminal Integrado',
              tempo: '8min atrás',
              impacto: '+12min no trajeto',
              cor: 'orange'
            },
            {
              tipo: 'MÉDIO',
              titulo: 'Protesto - Centro do Recife',
              descricao: 'Manifestação bloqueando parcialmente a Av. Dantas Barreto',
              local: 'Centro, próximo à Prefeitura',
              tempo: '15min atrás',
              impacto: '+8min no trajeto',
              cor: 'orange'
            },
          ].map((alerta, idx) => (
            <div key={idx} className={`border-l-4 ${
              alerta.cor === 'red' ? 'border-red-500 bg-red-500/10' : 'border-orange-500 bg-orange-500/10'
            } rounded-lg p-4`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    alerta.cor === 'red' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {alerta.tipo}
                  </span>
                  <h4 className="text-sm">{alerta.titulo}</h4>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{alerta.tempo}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{alerta.descricao}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Navigation2 className="w-3 h-3" />
                  {alerta.local}
                </span>
                <span className={`px-2 py-1 rounded ${
                  alerta.cor === 'red' ? 'bg-red-500/20 text-red-600' : 'bg-orange-500/20 text-orange-600'
                }`}>
                  {alerta.impacto}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* US-03: Análise de Padrões Históricos */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3>US-03 | Análise de Padrões Históricos</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Curva de calor por faixa horária baseada nos últimos 30 dias para escolher a janela ideal de saída
        </p>

        <ResponsiveContainer width="100%" height={250} key="logistica-padrao">
          <AreaChart data={padraoSemanal}>
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
            <Area
              type="monotone"
              dataKey="manha"
              name="Manhã (6h-12h)"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="tarde"
              name="Tarde (12h-18h)"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="noite"
              name="Noite (18h-22h)"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h4 className="text-sm">Pior Horário - Manhã</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Quinta-feira, 7h-9h</p>
            <p className="text-2xl">95%</p>
            <p className="text-xs text-muted-foreground">ocupação média</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h4 className="text-sm">Melhor Horário</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Domingo, 6h-10h</p>
            <p className="text-2xl">28%</p>
            <p className="text-xs text-muted-foreground">ocupação média</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm">Recomendação IA</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Para frotas pesadas</p>
            <p className="text-sm">Sábado 5h-11h</p>
            <p className="text-xs text-muted-foreground">ou Dom 6h-14h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
