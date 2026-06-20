import { CheckCircle, Zap, Database, FileEdit, Eye, Plus, Trash2, Settings, Users, Truck, Briefcase, Shield, ExternalLink } from 'lucide-react';

interface BoardRequisitosProps {
  onNavigateToScreenFlow?: (sectionId: string) => void;
}

export function BoardRequisitos({ onNavigateToScreenFlow }: BoardRequisitosProps) {
  // User Stories por Persona com mapeamento para seções
  const userStories = {
    logistica: {
      sectionId: 'logistica',
      stories: [
        { id: 'US-01', titulo: 'Previsão de Tráfego Antecipada', funcionalidade: 'Visualizar previsão com 2h, 4h, 6h de antecedência' },
        { id: 'US-02', titulo: 'Alertas de Incidentes', funcionalidade: 'Notificações < 2min sobre sinistros e alagamentos' },
        { id: 'US-03', titulo: 'Padrões Históricos', funcionalidade: 'Análise de 30 dias com curva de calor horária' },
      ]
    },
    porto: {
      sectionId: 'porto',
      stories: [
        { id: 'US-04', titulo: 'Comparação Multimodal', funcionalidade: 'ETA, custo e CO₂ entre carro, ônibus e bike' },
        { id: 'US-05', titulo: 'Status das Pontes', funcionalidade: 'Indicadores verde/amarelo/vermelho em tempo real' },
        { id: 'US-06', titulo: 'Estacionamento', funcionalidade: '% ocupação Zona Azul e privados' },
        { id: 'US-07', titulo: 'Horário Ideal IA', funcionalidade: 'Notificação push para evitar pico' },
      ]
    },
    gestor: {
      sectionId: 'gestor',
      stories: [
        { id: 'US-08', titulo: 'Visão Unificada', funcionalidade: 'Painel macro consolidando todo ecossistema viário' },
        { id: 'US-09', titulo: 'Gargalos Recorrentes', funcionalidade: 'Identificação automática de pontos críticos' },
        { id: 'US-10', titulo: 'Recomendações Investimento', funcionalidade: 'IA sugere onde aplicar orçamento do PPA' },
        { id: 'US-11', titulo: 'Simulação Digital Twin', funcionalidade: 'Impacto pré-obra em vias vizinhas' },
        { id: 'US-12', titulo: 'ROI Social', funcionalidade: 'Relatórios antes/depois de obras' },
        { id: 'US-13', titulo: 'Antecipação Eventos', funcionalidade: 'Previsão Carnaval, jogos e clima' },
        { id: 'US-14', titulo: 'Contingência IA', funcionalidade: 'Desvios e semáforos temporários automáticos' },
        { id: 'US-15', titulo: 'Log de Auditoria', funcionalidade: 'Registro criptográfico IA vs Humano' },
      ]
    }
  };

  const requisitosFuncionais = [
    {
      id: 'RF001',
      titulo: 'Monitoramento em Tempo Real',
      descricao: 'Sistema deve exibir dados de fluxo de veículos em tempo real das 3 pontes principais',
      status: 'Implementado',
      telas: ['Dashboard', 'Mapa']
    },
    {
      id: 'RF002',
      titulo: 'Visualização de Alertas',
      descricao: 'Sistema deve categorizar e exibir alertas por criticidade (crítico, aviso, info, sucesso)',
      status: 'Implementado',
      telas: ['Alertas', 'Dashboard']
    },
    {
      id: 'RF003',
      titulo: 'Previsão por IA',
      descricao: 'Sistema deve gerar previsões de tráfego usando rede neural (LSTM + Transformer)',
      status: 'Implementado',
      telas: ['Análise IA']
    },
    {
      id: 'RF004',
      titulo: 'Mapa Interativo',
      descricao: 'Sistema deve exibir mapa com marcadores de pontes e status visual por cores',
      status: 'Implementado',
      telas: ['Mapa']
    },
    {
      id: 'RF005',
      titulo: 'Gráficos de Análise',
      descricao: 'Sistema deve gerar gráficos de fluxo por hora, ocupação por ponte e comparação de eficiência',
      status: 'Implementado',
      telas: ['Dashboard', 'Análise IA']
    },
    {
      id: 'RF006',
      titulo: 'Recomendações Automáticas',
      descricao: 'IA deve gerar recomendações de rotas alternativas e ajustes de semáforos',
      status: 'Implementado',
      telas: ['Análise IA']
    },
    {
      id: 'RF007',
      titulo: 'Histórico de Alertas',
      descricao: 'Sistema deve manter registro de alertas resolvidos com timestamp',
      status: 'Implementado',
      telas: ['Alertas']
    },
    {
      id: 'RF008',
      titulo: 'Status de Conexão',
      descricao: 'Sistema deve indicar status online/offline da conexão com APIs públicas',
      status: 'Implementado',
      telas: ['Header']
    }
  ];

  const requisitosNaoFuncionais = [
    {
      id: 'RNF001',
      categoria: 'Usabilidade',
      titulo: 'Interface Responsiva',
      descricao: 'Interface deve adaptar-se a dispositivos mobile e desktop',
      metrica: '100% responsivo (mobile-first)'
    },
    {
      id: 'RNF002',
      categoria: 'Performance',
      titulo: 'Tempo de Resposta',
      descricao: 'Dashboards devem carregar em menos de 2 segundos',
      metrica: '< 2s tempo de carregamento'
    },
    {
      id: 'RNF003',
      categoria: 'Disponibilidade',
      titulo: 'Alta Disponibilidade',
      descricao: 'Sistema deve operar 24/7 com mínimo downtime',
      metrica: '99.9% uptime'
    },
    {
      id: 'RNF004',
      categoria: 'Escalabilidade',
      titulo: 'Processamento em Tempo Real',
      descricao: 'Sistema deve processar dados de 15 sensores simultaneamente',
      metrica: '15+ sensores simultâneos'
    },
    {
      id: 'RNF005',
      categoria: 'Segurança',
      titulo: 'Dados Públicos',
      descricao: 'Sistema utiliza apenas APIs públicas sem necessidade de autenticação',
      metrica: 'APIs públicas validadas'
    },
    {
      id: 'RNF006',
      categoria: 'Precisão',
      titulo: 'Acurácia da IA',
      descricao: 'Modelo de IA deve manter acurácia mínima nas previsões',
      metrica: '>95% acurácia'
    },
    {
      id: 'RNF007',
      categoria: 'Compatibilidade',
      titulo: 'Suporte Multi-browser',
      descricao: 'Interface compatível com navegadores modernos',
      metrica: 'Chrome, Firefox, Safari, Edge'
    },
    {
      id: 'RNF008',
      categoria: 'Acessibilidade',
      titulo: 'Design System',
      descricao: 'Interface construída com componentes reutilizáveis e tokens de design',
      metrica: 'Radix UI + Tailwind CSS'
    }
  ];

  const operacoesCRUD = [
    {
      operacao: 'CREATE',
      icone: Plus,
      cor: 'green',
      funcionalidades: [
        { nome: 'Criar Alertas', descricao: 'Sistema gera novos alertas baseado em condições de tráfego', entidade: 'Alertas' },
        { nome: 'Criar Recomendações IA', descricao: 'IA cria novas recomendações de otimização', entidade: 'Recomendações' },
        { nome: 'Criar Registros de Fluxo', descricao: 'Sistema registra novos dados de sensores', entidade: 'Dados de Sensores' }
      ]
    },
    {
      operacao: 'READ',
      icone: Eye,
      cor: 'blue',
      funcionalidades: [
        { nome: 'Consultar Status de Pontes', descricao: 'Visualizar status e ocupação de todas as pontes', entidade: 'Pontes' },
        { nome: 'Consultar Alertas Ativos', descricao: 'Listar alertas por criticidade e status', entidade: 'Alertas' },
        { nome: 'Consultar Histórico', descricao: 'Visualizar dados históricos de tráfego', entidade: 'Histórico de Tráfego' },
        { nome: 'Consultar Previsões', descricao: 'Visualizar previsões da IA para próximas horas', entidade: 'Previsões IA' },
        { nome: 'Consultar Métricas', descricao: 'Visualizar KPIs de desempenho do sistema', entidade: 'Métricas' }
      ]
    },
    {
      operacao: 'UPDATE',
      icone: FileEdit,
      cor: 'orange',
      funcionalidades: [
        { nome: 'Atualizar Status de Alertas', descricao: 'Marcar alertas como resolvidos ou ativos', entidade: 'Alertas' },
        { nome: 'Atualizar Dados em Tempo Real', descricao: 'Atualizar dados de sensores a cada ciclo', entidade: 'Dados de Sensores' },
        { nome: 'Atualizar Configurações IA', descricao: 'Ajustar parâmetros do modelo neural', entidade: 'Configurações IA' }
      ]
    },
    {
      operacao: 'DELETE',
      icone: Trash2,
      cor: 'red',
      funcionalidades: [
        { nome: 'Arquivar Alertas Antigos', descricao: 'Remover alertas resolvidos após período', entidade: 'Alertas' },
        { nome: 'Limpar Dados Históricos', descricao: 'Remover dados antigos para otimização', entidade: 'Histórico de Tráfego' }
      ]
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl">Board de Requisitos MVP</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Sistema de Controle de Tráfego - Pontes do Recife
        </p>
      </div>

      {/* User Stories por Persona */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl sm:text-2xl">User Stories - 15 Implementadas</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Prestador de Serviço Logístico */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm">Prestador Logístico</h3>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-600 rounded ml-auto">
                {userStories.logistica.stories.length} US
              </span>
            </div>
            <div className="space-y-2">
              {userStories.logistica.stories.map((us) => (
                <button
                  key={us.id}
                  onClick={() => onNavigateToScreenFlow?.(userStories.logistica.sectionId)}
                  className="w-full bg-card hover:bg-blue-500/5 border border-transparent hover:border-blue-500/30 rounded p-2 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded">
                      {us.id}
                    </span>
                    <span className="text-xs flex-1">{us.titulo}</span>
                    <ExternalLink className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground">{us.funcionalidade}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Trabalhador Porto Digital */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm">Porto Digital</h3>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-600 rounded ml-auto">
                {userStories.porto.stories.length} US
              </span>
            </div>
            <div className="space-y-2">
              {userStories.porto.stories.map((us) => (
                <button
                  key={us.id}
                  onClick={() => onNavigateToScreenFlow?.(userStories.porto.sectionId)}
                  className="w-full bg-card hover:bg-purple-500/5 border border-transparent hover:border-purple-500/30 rounded p-2 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-purple-500/10 text-purple-600 rounded">
                      {us.id}
                    </span>
                    <span className="text-xs flex-1">{us.titulo}</span>
                    <ExternalLink className="w-3 h-3 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground">{us.funcionalidade}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Gestor Público */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-sm">Gestor Público</h3>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded ml-auto">
                {userStories.gestor.stories.length} US
              </span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {userStories.gestor.stories.map((us) => (
                <button
                  key={us.id}
                  onClick={() => onNavigateToScreenFlow?.(userStories.gestor.sectionId)}
                  className="w-full bg-card hover:bg-green-500/5 border border-transparent hover:border-green-500/30 rounded p-2 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded">
                      {us.id}
                    </span>
                    <span className="text-xs flex-1">{us.titulo}</span>
                    <ExternalLink className="w-3 h-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground">{us.funcionalidade}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requisitos Funcionais */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl sm:text-2xl">Requisitos Funcionais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requisitosFuncionais.map((req) => (
            <div key={req.id} className="bg-card border border-border rounded-lg p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded">
                      {req.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded">
                      {req.status}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base mt-2">{req.titulo}</h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                {req.descricao}
              </p>
              <div className="flex flex-wrap gap-1">
                {req.telas.map((tela) => (
                  <span key={tela} className="text-xs px-2 py-1 bg-muted rounded">
                    📱 {tela}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requisitos Não Funcionais */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl sm:text-2xl">Requisitos Não Funcionais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requisitosNaoFuncionais.map((req) => (
            <div key={req.id} className="bg-card border border-border rounded-lg p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 bg-purple-500/10 text-purple-600 rounded">
                      {req.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded">
                      {req.categoria}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base mt-2">{req.titulo}</h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                {req.descricao}
              </p>
              <div className="flex items-center gap-2 text-xs px-2 py-1 bg-blue-500/5 border border-blue-500/10 rounded">
                <Settings className="w-3 h-3 text-blue-600" />
                <span className="text-blue-600">{req.metrica}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sistema CRUD */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl">Sistema CRUD</h2>
        </div>
        <div className="space-y-6">
          {operacoesCRUD.map((crud) => {
            const Icon = crud.icone;
            const corClasses = {
              green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-600' },
              blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600' },
              orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-600' },
              red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600' }
            }[crud.cor];

            return (
              <div key={crud.operacao} className={`border ${corClasses.border} ${corClasses.bg} rounded-lg p-4 sm:p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-6 h-6 ${corClasses.text}`} />
                  <h3 className="text-lg sm:text-xl">{crud.operacao}</h3>
                  <span className="text-xs px-2 py-1 bg-background/50 rounded">
                    {crud.funcionalidades.length} funcionalidades
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {crud.funcionalidades.map((func, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          crud.cor === 'green' ? 'bg-green-500' :
                          crud.cor === 'blue' ? 'bg-blue-500' :
                          crud.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm mb-1">{func.nome}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {func.descricao}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded inline-block">
                            🗂️ {func.entidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg sm:text-xl mb-4">Resumo do Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-1">15</div>
            <div className="text-xs sm:text-sm text-muted-foreground">User Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-1">3</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Personas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-1">{requisitosFuncionais.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Req. Funcionais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-1">{requisitosNaoFuncionais.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Req. Não Funcionais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl mb-1">
              {operacoesCRUD.reduce((acc, crud) => acc + crud.funcionalidades.length, 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Operações CRUD</div>
          </div>
        </div>
      </div>

      {/* Entidades do Sistema */}
      <div>
        <h2 className="text-xl sm:text-2xl mb-4">Entidades do Sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { nome: 'Pontes', atributos: ['ID', 'Nome', 'Latitude', 'Longitude', 'Status', 'Fluxo %'] },
            { nome: 'Alertas', atributos: ['ID', 'Tipo', 'Título', 'Descrição', 'Local', 'Timestamp', 'Status'] },
            { nome: 'Dados de Sensores', atributos: ['ID', 'Ponte ID', 'Veículos/hora', 'Timestamp', 'Ocupação %'] },
            { nome: 'Previsões IA', atributos: ['ID', 'Timestamp', 'Fluxo Previsto', 'Confiança %'] },
            { nome: 'Recomendações', atributos: ['ID', 'Tipo', 'Mensagem', 'Prioridade', 'Timestamp'] },
            { nome: 'Métricas', atributos: ['ID', 'Acurácia IA', 'Tempo Economizado', 'Otimizações', 'CO₂ Reduzido'] }
          ].map((entidade) => (
            <div key={entidade.nome} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm">{entidade.nome}</h4>
              </div>
              <div className="space-y-1">
                {entidade.atributos.map((attr) => (
                  <div key={attr} className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    {attr}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
