import { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Mapa } from './components/Mapa';
import { AnaliseIA } from './components/AnaliseIA';
import { Alertas } from './components/Alertas';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'mapa':
        return <Mapa />;
      case 'analise':
        return <AnaliseIA />;
      case 'alertas':
        return <Alertas />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="pb-8">
        {renderContent()}
      </main>
    </div>
  );
}
