import { Shield, BarChart3, AlertTriangle, Coins, Calendar, FileCheck, Construction, CloudRain, Lock } from 'lucide-react';
import { pontesService } from '../../services/PontesService';
import { usePontesData } from '../hooks/usePontesData';

// US-09: Gargalos Recorrentes
const gargalosRecorrentes = [
  { interseção: 'Av. Agamenon x Conde da Boa Vista', perdaVelocidade: 78, horasAtraso: 145, prioridade: 1 },
  { interseção: 'Av. Norte x Rua Imperial', perdaVelocidade: 71, horasAtraso: 132, prioridade: 2 },
  { interseção: 'Ponte Duarte Coelho (entrada)', perdaVelocidade: 68, horasAtraso: 118, prioridade: 3 },
  { interseção: 'Av. Caxangá x BR-101', perdaVelocidade: 62, horasAtraso: 98, prioridade: 4 },
  { interseção: 'Av. Boa Viagem x Pina', perdaVelocidade: 58, horasAtraso: 87, prioridade: 5 },
];

// US-10: Recomendações de Investimento
const recomendacoesInvestimento = [
  {
    local: 'Interseção Agamenon x Conde Boa Vista',
    tipo: 'Novo viaduto + sincronização semafórica',
    custoEstimado: 'R$ 12,5M',
    horasPoupadas: '145h/semana',
    roi: '2,3 anos',
    impacto: 'Alto'
  },
  {
    local: 'Corredor Av. Norte',
    tipo: 'BRT + 3 faixas exclusivas',
    custoEstimado: 'R$ 28M',
    horasPoupadas: '132h/semana',
    roi: '3,1 anos',
    impacto: 'Alto'
  },
  {
    local: 'Ponte Duarte Coelho',
    tipo: 'Duplicação de faixas',
    custoEstimado: 'R$ 8,2M',
    horasPoupadas: '118h/semana',
    roi: '1,8 anos',
    impacto: 'Médio-Alto'
  },
];

// US-12: ROI Social de Obras
const obrasConcluidas = [
  {
    obra: 'Alargamento Av. Caxangá (km 8-12)',
    periodo: 'Jan/2024 - Ago/2024',
    investimento: 'R$ 15,2M',
    tempoAntes: '38min',
    tempoDepois: '22min',
    reducao: '42%',
    horasPoupadas: '89h/semana',
    valorSocial: 'R$ 4,2M/ano'
  },
  {
    obra: 'Nova Sinalização Inteligente - Centro',
    periodo: 'Mar/2024 - Jun/2024',
    investimento: 'R$ 3,8M',
    tempoAntes: '25min',
    tempoDepois: '18min',
    reducao: '28%',
    horasPoupadas: '52h/semana',
    valorSocial: 'R$ 2,1M/ano'
  },
];

export function GestorPublico() {
  const logAuditoria = usePontesData(() => pontesService.getLogAuditoria(), []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Header Persona */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl mb-2">Gestor Público de Mobilidade Urbana</h2>
            <p className="text-sm text-muted-foreground">
              Ferramentas de diagnóstico, planejamento orçamentário e governança baseadas em IA
            </p>
          </div>
        </div>
      </div>

      {/* US-08: Visão Unificada em Tempo Real */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3>US-08 | Visão Unificada do Ecossistema Viário</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Painel macro consolidando velocidades médias e índices globais para monitoramento e respostas rápidas
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { titulo: 'Velocidade Média Global', valor: '32 km/h', meta: 'Meta: 35 km/h', cor: 'orange' },
            { titulo: 'Índice de Fluidez', valor: '68%', meta: 'Meta: 75%', cor: 'orange' },
            { titulo: 'Vias em Estado Crítico', valor: '12', meta: 'de 187 monitoradas', cor: 'red' },
            { titulo: 'Eficiência Semafórica', valor: '82%', meta: 'Meta: 85%', cor: 'green' },
          ].map((metrica) => (
            <div key={metrica.titulo} className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-xs text-muted-foreground mb-2">{metrica.titulo}</h4>
              <p className={`text-2xl sm:text-3xl mb-1 ${
                metrica.cor === 'green' ? 'text-green-600' :
                metrica.cor === 'orange' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {metrica.valor}
              </p>
              <p className="text-xs text-muted-foreground">{metrica.meta}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-sm mb-3">Status dos Subsistemas</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { sistema: 'Semáforos Inteligentes', status: 'Operacional', percentual: 98 },
              { sistema: 'Sensores de Fluxo', status: 'Operacional', percentual: 95 },
              { sistema: 'Câmeras de Monitoramento', status: 'Degradado', percentual: 87 },
              { sistema: 'API Pública de Dados', status: 'Operacional', percentual: 100 },
            ].map((sys) => (
              <div key={sys.sistema} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  sys.percentual >= 95 ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{sys.sistema}</p>
                  <p className="text-xs text-muted-foreground">{sys.percentual}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* US-09: Gargalos Recorrentes */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3>US-09 | Catalogação de Gargalos Recorrentes</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Identificação automatizada de pontos críticos para priorizar estudos de engenharia de tráfego
        </p>

        <div className="space-y-3">
          {gargalosRecorrentes.map((gargalo) => (
            <div key={gargalo.interseção} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm flex-shrink-0">
                    {gargalo.prioridade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm mb-1">{gargalo.interseção}</h4>
                    <p className="text-xs text-muted-foreground">
                      {gargalo.horasAtraso}h de atraso acumulado/semana
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-600 rounded whitespace-nowrap">
                  -{gargalo.perdaVelocidade}% velocidade
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${gargalo.perdaVelocidade}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* US-10: Recomendações de Investimento */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-yellow-600" />
          <h3>US-10 | Recomendações de Investimento IA</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Análise de volumetria e atrasos para embasar tecnicamente o Plano Plurianual (PPA)
        </p>

        <div className="space-y-4">
          {recomendacoesInvestimento.map((rec, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded">
                      Prioridade {idx + 1}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.impacto === 'Alto' ? 'bg-red-500/20 text-red-600' : 'bg-orange-500/20 text-orange-600'
                    }`}>
                      Impacto {rec.impacto}
                    </span>
                  </div>
                  <h4 className="text-sm mb-1">{rec.local}</h4>
                  <p className="text-xs text-muted-foreground">{rec.tipo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Investimento</p>
                  <p className="text-sm">{rec.custoEstimado}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Horas Poupadas</p>
                  <p className="text-sm text-green-600">{rec.horasPoupadas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROI Estimado</p>
                  <p className="text-sm">{rec.roi}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <button className="w-full px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:opacity-90">
                    Ver Simulação
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* US-11: Simulação de Impacto Digital Twin */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Construction className="w-5 h-5 text-orange-600" />
          <h3>US-11 | Simulação de Impacto Pré-Obra (Digital Twin)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Simule desvios e impactos nas vias vizinhas antes da licitação
        </p>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <h4 className="text-sm mb-3">Cenário: Obra na Av. Agamenon (3 meses)</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-card rounded-lg p-3">
              <h5 className="text-xs text-muted-foreground mb-2">Impacto Previsto</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Av. Agamenon:</span>
                  <span className="text-red-600">+45% tempo</span>
                </div>
                <div className="flex justify-between">
                  <span>Rua da Aurora (desvio):</span>
                  <span className="text-orange-600">+28% tempo</span>
                </div>
                <div className="flex justify-between">
                  <span>Conde Boa Vista:</span>
                  <span className="text-orange-600">+18% tempo</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-3">
              <h5 className="text-xs text-muted-foreground mb-2">Mitigações Sugeridas</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>Sincronizar semáforos Rua da Aurora (+12% capacidade)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>Horário de obra: 22h-6h (reduz impacto em 67%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>Sinalização dinâmica de desvio via app</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:opacity-90">
            Rodar Nova Simulação
          </button>
        </div>
      </div>

      {/* US-12: Comprovação de ROI Social */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-green-600" />
          <h3>US-12 | Comprovação de ROI Social</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Relatórios comparativos antes/depois para auditoria e prestação de contas
        </p>

        <div className="space-y-4">
          {obrasConcluidas.map((obra, idx) => (
            <div key={idx} className="border border-green-500/30 bg-green-500/5 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm mb-1">{obra.obra}</h4>
                  <p className="text-xs text-muted-foreground">{obra.periodo}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded whitespace-nowrap">
                  Concluída
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="bg-card rounded p-2">
                  <p className="text-xs text-muted-foreground">Investimento</p>
                  <p className="text-sm">{obra.investimento}</p>
                </div>
                <div className="bg-card rounded p-2">
                  <p className="text-xs text-muted-foreground">Tempo Antes</p>
                  <p className="text-sm text-red-600">{obra.tempoAntes}</p>
                </div>
                <div className="bg-card rounded p-2">
                  <p className="text-xs text-muted-foreground">Tempo Depois</p>
                  <p className="text-sm text-green-600">{obra.tempoDepois}</p>
                </div>
                <div className="bg-card rounded p-2">
                  <p className="text-xs text-muted-foreground">Redução</p>
                  <p className="text-sm font-medium">{obra.reducao}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Social Gerado</p>
                  <p className="text-lg text-green-600">{obra.valorSocial}</p>
                </div>
                <button className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:opacity-90">
                  Baixar Relatório PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* US-13: Antecipação de Grandes Eventos */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3>US-13 | Antecipação de Grandes Eventos</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Previsão de impacto de eventos ou fortes chuvas para mobilizar equipes com antecedência
        </p>

        <div className="space-y-3">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm mb-2">🎭 Carnaval 2027 - Previsão 120 dias</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="bg-card rounded p-2">
                    <p className="text-xs text-muted-foreground">Aumento de Fluxo</p>
                    <p className="text-lg text-purple-600">+340%</p>
                  </div>
                  <div className="bg-card rounded p-2">
                    <p className="text-xs text-muted-foreground">Público Estimado</p>
                    <p className="text-lg">2,8M pessoas</p>
                  </div>
                  <div className="bg-card rounded p-2">
                    <p className="text-xs text-muted-foreground">Vias Afetadas</p>
                    <p className="text-lg text-orange-600">47</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:opacity-90">
                  Ver Plano de Contingência
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CloudRain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm mb-2">🌧️ Alerta Meteorológico - Chuvas Intensas</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Previsão: 80mm nas próximas 24h (INMET) - Risco de alagamento em 12 pontos críticos
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:opacity-90">
                    Acionar Equipes de Drenagem
                  </button>
                  <button className="px-3 py-1.5 bg-card border border-border rounded text-xs hover:bg-muted">
                    Ver Pontos de Alagamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* US-14 & US-15: Contingência + Auditoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* US-14 */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="text-sm">US-14 | Planos de Contingência por IA</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Sugestões automáticas de desvios e sincronização semafórica
          </p>
          <div className="space-y-2 text-xs mb-4">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
              <span>3 rotas de fuga alternativas calculadas</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
              <span>Malha semafórica temporária pronta</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
              <span>Notificação via app para 45k motoristas</span>
            </div>
          </div>
          <button className="w-full px-3 py-2 bg-orange-600 text-white rounded text-sm hover:opacity-90">
            Ativar Contingência
          </button>
        </div>

        {/* US-15 */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="text-sm">US-15 | Log de Auditoria da IA</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Registro imutável diferenciando ações da IA vs humanas
          </p>
          <div className="space-y-2 mb-4">
            {logAuditoria.map((log) => (
              <div key={log.id} className="text-xs bg-muted/50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.decisaoHumana === null
                        ? 'bg-blue-500/20 text-blue-600'
                        : log.concordancia
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-orange-500/20 text-orange-600'
                    }`}>
                      {log.decisaoHumana === null ? 'IA autônoma' : log.concordancia ? 'IA aprovada' : 'IA rejeitada'}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {log.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="font-medium">{log.acao}</p>
                <p className="text-muted-foreground mt-0.5">{log.decisaoIA}</p>
                {log.decisaoHumana && (
                  <p className="text-muted-foreground mt-0.5 italic">↳ {log.decisaoHumana}</p>
                )}
                <p className="text-muted-foreground/50 mt-1 font-mono text-[9px]">
                  SHA: {log.hash}
                </p>
              </div>
            ))}
          </div>
          <button className="w-full px-3 py-2 bg-card border border-border rounded text-sm hover:bg-muted">
            Exportar Log Completo
          </button>
        </div>
      </div>
    </div>
  );
}
