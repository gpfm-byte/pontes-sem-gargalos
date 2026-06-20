import { Briefcase, Car, Bus, Bike, MapPin, ParkingCircle, Bell } from 'lucide-react';

export function PortoDigital() {
  // US-04: Comparação Multimodal
  const comparacaoModais = [
    {
      modal: 'Carro',
      icone: Car,
      tempo: '18min',
      custo: 'R$ 12,50',
      co2: '2.8kg',
      cor: 'red',
      detalhes: 'Combustível + Estacionamento'
    },
    {
      modal: 'Ônibus',
      icone: Bus,
      tempo: '32min',
      custo: 'R$ 4,50',
      co2: '0.4kg',
      cor: 'blue',
      detalhes: '2 linhas + 1 baldeação'
    },
    {
      modal: 'Bike',
      icone: Bike,
      tempo: '25min',
      custo: 'R$ 0,00',
      co2: '0.0kg',
      cor: 'green',
      detalhes: 'Via ciclovia Av. Sul',
      recomendado: true
    },
  ];

  // US-05: Status das Pontes de Acesso
  const pontesAcesso = [
    { nome: 'Ponte Boa Vista', status: 'livre', fluxo: 42, tempo: '3min', cor: 'green' },
    { nome: 'Ponte Maurício de Nassau', status: 'moderado', fluxo: 68, tempo: '7min', cor: 'orange' },
    { nome: 'Ponte Duarte Coelho', status: 'congestionado', fluxo: 91, tempo: '15min', cor: 'red' },
    { nome: 'Ponte Princesa Isabel', status: 'livre', fluxo: 38, tempo: '2min', cor: 'green' },
    { nome: 'Ponte Limoeiro', status: 'moderado', fluxo: 72, tempo: '8min', cor: 'orange' },
  ];

  // US-06: Disponibilidade de Estacionamento
  const estacionamentos = [
    { nome: 'Zona Azul - Rua do Bom Jesus', total: 45, ocupados: 38, percentual: 84, tipo: 'público' },
    { nome: 'Zona Azul - Av. Alfredo Lisboa', total: 32, ocupados: 28, percentual: 88, tipo: 'público' },
    { nome: 'Porto Digital Park', total: 120, ocupados: 95, percentual: 79, tipo: 'privado' },
    { nome: 'Estacionamento Marco Zero', total: 80, ocupados: 22, percentual: 28, tipo: 'privado' },
    { nome: 'Shopping Paço Alfândega', total: 200, ocupados: 142, percentual: 71, tipo: 'privado' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Header Persona */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl mb-2">Trabalhador do Porto Digital</h2>
            <p className="text-sm text-muted-foreground">
              Escolha o melhor modal e rota para acessar o Bairro do Recife com eficiência
            </p>
          </div>
        </div>
      </div>

      {/* US-04: Comparação Multimodal */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-blue-600" />
          <h3>US-04 | Comparação Multimodal em Tempo Real</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Compare ETA, custo e emissão de CO₂ entre diferentes modais de transporte
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparacaoModais.map((modal) => {
            const Icon = modal.icone;
            return (
              <div
                key={modal.modal}
                className={`relative border-2 rounded-lg p-5 transition-all ${
                  modal.recomendado
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {modal.recomendado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      ✓ Recomendado pela IA
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    modal.cor === 'green' ? 'bg-green-500/20' :
                    modal.cor === 'blue' ? 'bg-blue-500/20' : 'bg-red-500/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      modal.cor === 'green' ? 'text-green-600' :
                      modal.cor === 'blue' ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-lg">{modal.modal}</h4>
                    <p className="text-xs text-muted-foreground">{modal.detalhes}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Tempo</span>
                    <span className="text-sm">{modal.tempo}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Custo</span>
                    <span className="text-sm">{modal.custo}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">CO₂</span>
                    <span className="text-sm">{modal.co2}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* US-05: Monitoramento das Pontes de Acesso */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-orange-600" />
          <h3>US-05 | Status das Pontes de Acesso ao Bairro do Recife</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Indicadores em tempo real para escolher a melhor entrada para a ilha
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pontesAcesso.map((ponte) => (
            <div
              key={ponte.nome}
              className={`border-2 rounded-lg p-4 ${
                ponte.cor === 'green' ? 'border-green-500 bg-green-500/5' :
                ponte.cor === 'orange' ? 'border-orange-500 bg-orange-500/5' :
                'border-red-500 bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  ponte.cor === 'green' ? 'bg-green-500' :
                  ponte.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                } animate-pulse`} />
                <h4 className="text-sm flex-1">{ponte.nome}</h4>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Fluxo</span>
                    <span className={
                      ponte.cor === 'green' ? 'text-green-600' :
                      ponte.cor === 'orange' ? 'text-orange-600' : 'text-red-600'
                    }>
                      {ponte.fluxo}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        ponte.cor === 'green' ? 'bg-green-500' :
                        ponte.cor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${ponte.fluxo}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <span className="text-muted-foreground">Tempo estimado</span>
                  <span className="font-medium">{ponte.tempo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm mb-1">Recomendação IA</h4>
              <p className="text-sm text-muted-foreground">
                Use a <strong>Ponte Princesa Isabel</strong> - Menor tempo (2min) e fluxo livre (38%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* US-06: Disponibilidade de Estacionamento */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ParkingCircle className="w-5 h-5 text-purple-600" />
          <h3>US-06 | Disponibilidade de Estacionamento</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Nível de ocupação em tempo real de vagas Zona Azul e estacionamentos privados
        </p>

        <div className="space-y-3">
          {estacionamentos.map((est) => (
            <div key={est.nome} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm">{est.nome}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      est.tipo === 'público'
                        ? 'bg-blue-500/20 text-blue-600'
                        : 'bg-purple-500/20 text-purple-600'
                    }`}>
                      {est.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {est.ocupados} de {est.total} vagas ocupadas
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl ${
                    est.percentual < 50 ? 'text-green-600' :
                    est.percentual < 80 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {est.percentual}%
                  </div>
                  <div className="text-xs text-muted-foreground">ocupação</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      est.percentual < 50 ? 'bg-green-500' :
                      est.percentual < 80 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${est.percentual}%` }}
                  />
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  est.percentual < 50 ? 'bg-green-500/20 text-green-600' :
                  est.percentual < 80 ? 'bg-orange-500/20 text-orange-600' :
                  'bg-red-500/20 text-red-600'
                }`}>
                  {est.total - est.ocupados} livres
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* US-07: Sugestão de Horário Ideal */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2">US-07 | Sugestão de Horário Ideal por IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notificação push baseada em análise preditiva para evitar pico de tráfego
            </p>

            <div className="space-y-3">
              <div className="bg-card border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">💡 Melhor horário para sair AGORA</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Saia <strong>nos próximos 15 minutos</strong> para evitar o pico das 18h
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded">
                        Economize até 12 minutos
                      </span>
                      <span className="text-muted-foreground">vs. saída às 18h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">⚠️ Alternativa: Espere 45min</h4>
                    <p className="text-sm text-muted-foreground">
                      Após 18:45h o tráfego reduz em 35% nas pontes de saída
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
