import { AlertTriangle, CheckCircle, Info, XCircle, Clock } from 'lucide-react';
import { pontesService } from '../../services/PontesService';
import { usePontesData } from '../hooks/usePontesData';

function tempoRelativo(data: Date): string {
  const diff = Math.floor((Date.now() - data.getTime()) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min atrás`;
  return `${Math.floor(diff / 60)}h atrás`;
}

export function Alertas() {
  // Polling de 4s: reflete o feed ao vivo (simulador de tempo real da CTTU).
  const alertasAtivosRaw = usePontesData(() => pontesService.getAlertasAtivos(), [], 4000);
  const pontes = usePontesData(() => pontesService.getPontes(), []);

  const alertas = alertasAtivosRaw.map(a => {
    const ponte = pontes.find(p => p.id === a.ponteId);
    const nivelParaTipo: Record<string, string> = {
      critico: 'crítico', alto: 'aviso',
      medio: 'info', baixo: 'info',
    };
    const tipo = nivelParaTipo[a.nivel] ?? 'info';
    const icone = tipo === 'crítico' ? XCircle : tipo === 'aviso' ? AlertTriangle : Info;
    return {
      id: a.id,
      tipo,
      icone,
      titulo: a.mensagem.split('.')[0],
      descricao: a.mensagem,
      local: ponte?.nomeCompleto ?? a.ponteId,
      tempo: tempoRelativo(a.criadoEm),
      ativo: a.resolvidoEm === null,
    };
  });

  const getTipoClasses = (tipo: string) => {
    switch (tipo) {
      case 'crítico':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          icon: 'text-red-600',
          badge: 'bg-red-500',
        };
      case 'aviso':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          icon: 'text-orange-600',
          badge: 'bg-orange-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          icon: 'text-blue-600',
          badge: 'bg-blue-500',
        };
      case 'sucesso':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          icon: 'text-green-600',
          badge: 'bg-green-500',
        };
      default:
        return {
          bg: 'bg-muted',
          border: 'border-border',
          icon: 'text-muted-foreground',
          badge: 'bg-muted-foreground',
        };
    }
  };

  const alertasAtivos = alertas.filter(a => a.ativo);
  const alertasInativos = alertas.filter(a => !a.ativo);

  // Contagens derivadas dos dados ao vivo (antes: valores fixos no JSX).
  const nCriticos = alertasAtivos.filter(a => a.tipo === 'crítico').length;
  const nAvisos = alertasAtivos.filter(a => a.tipo === 'aviso').length;
  const nInformativos = alertasAtivos.filter(a => a.tipo === 'info').length;
  const nResolvidos = alertasInativos.length;

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            <span className="text-xs sm:text-sm text-muted-foreground">Críticos</span>
          </div>
          <p className="text-xl sm:text-2xl">{nCriticos}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            <span className="text-xs sm:text-sm text-muted-foreground">Avisos</span>
          </div>
          <p className="text-xl sm:text-2xl">{nAvisos}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-xs sm:text-sm text-muted-foreground">Informativos</span>
          </div>
          <p className="text-xl sm:text-2xl">{nInformativos}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-xs sm:text-sm text-muted-foreground">Resolvidos</span>
          </div>
          <p className="text-xl sm:text-2xl">{nResolvidos}</p>
        </div>
      </div>

      {/* Alertas Ativos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h3>Alertas Ativos ({alertasAtivos.length})</h3>
        </div>
        <div className="space-y-3">
          {alertasAtivos.map((alerta) => {
            const classes = getTipoClasses(alerta.tipo);
            const Icon = alerta.icone;

            return (
              <div
                key={alerta.id}
                className={`${classes.bg} border ${classes.border} rounded-lg p-4 sm:p-5`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${classes.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm sm:text-base">{alerta.titulo}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {alerta.tempo}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      {alerta.descricao}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-background/50 rounded">
                        📍 {alerta.local}
                      </span>
                      {alerta.ativo && (
                        <span className={`text-xs px-2 py-1 ${classes.badge} text-white rounded`}>
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico */}
      <div>
        <h3 className="mb-4">Histórico Recente</h3>
        <div className="space-y-2">
          {alertasInativos.map((alerta) => {
            const classes = getTipoClasses(alerta.tipo);
            const Icon = alerta.icone;

            return (
              <div
                key={alerta.id}
                className="bg-card border border-border rounded-lg p-3 sm:p-4 opacity-70"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${classes.icon} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm">{alerta.titulo}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alerta.local} • {alerta.tempo}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
