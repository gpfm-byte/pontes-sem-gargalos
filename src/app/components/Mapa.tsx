import { useEffect, useRef, useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { pontesService } from '../../services/PontesService';
import { usePontesData } from '../hooks/usePontesData';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface PonteData {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  status: string;
  fluxo: number;
  duration?: number;
  durationInTraffic?: number;
}

export function Mapa() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [pontesData, setPontesData] = useState<PonteData[]>([]);

  // Registro real de pontes via serviço — mesma fonte do resto do dashboard
  const statusPontes = usePontesData(() => pontesService.getStatusPontes(), []);

  useEffect(() => {
    if (statusPontes.length === 0) return;
    setPontesData(statusPontes.map((s, i) => ({
      id: i + 1,
      nome: s.ponte.nomeCompleto,
      lat: s.ponte.coordenadas.lat,
      lng: s.ponte.coordenadas.lng,
      status: s.status === 'normal' ? 'normal'
        : s.status === 'congestionado' || s.status === 'bloqueado' ? 'congestionado'
        : 'atenção',
      fluxo: s.leituraAtual.ocupacaoPct,
    })));
  }, [statusPontes]);

  useEffect(() => {
    // Carregar Google Maps API com camada de trânsito
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        initializeMap();
        return;
      }

      // Verificar se o script já foi adicionado
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          // Aguardar até que a API esteja totalmente carregada
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.Map) {
              clearInterval(checkGoogleMaps);
              initializeMap();
            }
          }, 100);
        });
        return;
      }

      const script = document.createElement('script');
      const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Aguardar até que a API esteja totalmente carregada
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            clearInterval(checkGoogleMaps);
            initializeMap();
          }
        }, 100);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps || !window.google.maps.Map || mapInstanceRef.current) return;

      const center = { lat: -8.0656, lng: -34.8731 };

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Ativar camada de trânsito
        const trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        mapInstanceRef.current = map;

        // Simular atualização de dados baseado em padrões de tráfego
        simulateTrafficData();
      } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
      }
    };

    const simulateTrafficData = () => {
      // Simula variações de tráfego realistas
      const hour = new Date().getHours();
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      const isWorkingHours = hour >= 8 && hour <= 18;

      setPontesData((prev) => {
        return prev.map((ponte) => {
          // Adiciona variação aleatória para simular mudanças
          const baseVariation = Math.random() * 20 - 10; // -10 to +10
          const rushHourModifier = isRushHour ? 15 : 0;
          const workingHoursModifier = isWorkingHours ? 5 : 0;

          let fluxo = ponte.fluxo + baseVariation + rushHourModifier + workingHoursModifier;
          fluxo = Math.max(30, Math.min(100, fluxo));

          let status = 'normal';
          if (fluxo >= 85) {
            status = 'congestionado';
          } else if (fluxo >= 70) {
            status = 'atenção';
          }

          // Simular tempos de viagem baseados no fluxo
          const baseDuration = 180 + Math.random() * 120; // 3-5 minutos base
          const trafficMultiplier = 1 + (fluxo / 100) * 0.5; // até 50% mais tempo
          const durationInTraffic = Math.round(baseDuration * trafficMultiplier);

          return {
            ...ponte,
            status,
            fluxo: Math.round(fluxo),
            duration: Math.round(baseDuration),
            durationInTraffic,
          };
        });
      });
    };

    loadGoogleMaps();

    // Atualizar dados simulados a cada 30 segundos para demonstração
    const interval = setInterval(() => {
      simulateTrafficData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Mapa de Trânsito em Tempo Real</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visualização de trânsito ao vivo do Google Maps com dados simulados das pontes
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-md">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Atualizado</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-[400px] sm:h-[500px] lg:h-[600px]"
          style={{ background: '#e5e7eb' }}
        />
      </div>

      {/* Bridge List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pontesData.map((ponte) => (
          <div key={ponte.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 flex-shrink-0 ${
                ponte.status === 'normal' ? 'text-green-500' :
                ponte.status === 'congestionado' ? 'text-red-500' : 'text-orange-500'
              }`}>
                <MapPin className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm truncate">{ponte.nome}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: {ponte.status === 'normal' ? 'Livre' :
                           ponte.status === 'congestionado' ? 'Congestionado' : 'Atenção'}
                </p>

                {ponte.durationInTraffic && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>
                      {Math.round(ponte.durationInTraffic / 60)} min
                      {ponte.duration && ponte.durationInTraffic > ponte.duration && (
                        <span className="text-orange-600 ml-1">
                          (+{Math.round((ponte.durationInTraffic - ponte.duration) / 60)} min)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        ponte.status === 'normal' ? 'bg-green-500' :
                        ponte.status === 'congestionado' ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${ponte.fluxo}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{ponte.fluxo}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm">Legenda do Trânsito</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Camada de trânsito do Google Maps</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Livre (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-muted-foreground">Atenção (70-85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Congestionado (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tempo estimado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
