import { useState } from 'react';
import { Truck, Briefcase, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Logistica } from './Logistica';
import { PortoDigital } from './PortoDigital';
import { GestorPublico } from './GestorPublico';

export function ScreenFlow() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['logistica', 'porto', 'gestor']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sections = [
    {
      id: 'logistica',
      title: 'Prestador de Serviço Logístico',
      icon: Truck,
      color: 'blue' as const,
      userStories: 3,
      description: 'Planejamento de rotas de entrega com previsões de IA',
      component: <Logistica />
    },
    {
      id: 'porto',
      title: 'Trabalhador do Porto Digital',
      icon: Briefcase,
      color: 'purple' as const,
      userStories: 4,
      description: 'Escolha do melhor modal e rota para o Bairro do Recife',
      component: <PortoDigital />
    },
    {
      id: 'gestor',
      title: 'Gestor Público de Mobilidade Urbana',
      icon: Shield,
      color: 'green' as const,
      userStories: 8,
      description: 'Diagnóstico, planejamento orçamentário e governança',
      component: <GestorPublico />
    }
  ];

  return (
    <div className="screenflow-container">
      {/* Header */}
      <div className="screenflow-header">
        <h1 className="text-3xl sm:text-4xl">Screen Flow - Fluxo Completo</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualização integrada de todas as personas e funcionalidades do sistema
        </p>
        <div className="screenflow-stats">
          <div className="screenflow-stat">
            <div className="screenflow-stat-value text-blue-600">3</div>
            <div className="screenflow-stat-label">Personas</div>
          </div>
          <div className="screenflow-stat">
            <div className="screenflow-stat-value text-purple-600">15</div>
            <div className="screenflow-stat-label">User Stories</div>
          </div>
          <div className="screenflow-stat">
            <div className="screenflow-stat-value text-green-600">100%</div>
            <div className="screenflow-stat-label">Implementadas</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="screenflow-nav">
        <h3 className="screenflow-nav-title">Navegação Rápida</h3>
        <div className="screenflow-nav-buttons">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                const element = document.getElementById(`section-${section.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`screenflow-nav-btn ${section.color}`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSections.includes(section.id);

        return (
          <div
            key={section.id}
            id={`section-${section.id}`}
            className="screenflow-section"
          >
            {/* Section Header */}
            <div className={`screenflow-section-header ${section.color}`}>
              <button
                onClick={() => toggleSection(section.id)}
                className="screenflow-section-toggle"
              >
                <div className="screenflow-section-info">
                  <div className={`screenflow-icon-wrapper ${section.color}`}>
                    <Icon className={`screenflow-icon ${section.color}`} />
                  </div>
                  <div className="screenflow-text">
                    <div className="screenflow-title-row">
                      <h2 className="text-lg sm:text-xl">{section.title}</h2>
                      <span className={`screenflow-badge ${section.color}`}>
                        {section.userStories} User Stories
                      </span>
                    </div>
                    <p className="screenflow-description">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div>
                  {isExpanded ? (
                    <ChevronUp className="screenflow-chevron" />
                  ) : (
                    <ChevronDown className="screenflow-chevron" />
                  )}
                </div>
              </button>
            </div>

            {/* Section Content */}
            {isExpanded && (
              <div className={`screenflow-section-content ${section.color}`}>
                {section.component}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary Footer */}
      <div className="screenflow-footer">
        <h3 className="screenflow-footer-title">Sistema Completo de Mobilidade Urbana</h3>
        <p className="screenflow-footer-description">
          Todas as funcionalidades implementadas e prontas para uso
        </p>
        <div className="screenflow-tags">
          <span className="screenflow-tag blue">Previsão IA</span>
          <span className="screenflow-tag purple">Comparação Multimodal</span>
          <span className="screenflow-tag green">Digital Twin</span>
          <span className="screenflow-tag orange">ROI Social</span>
          <span className="screenflow-tag red">Alertas Tempo Real</span>
        </div>
      </div>
    </div>
  );
}