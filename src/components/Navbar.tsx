import React from 'react';
import { Zap, BookOpen, Utensils, FileSpreadsheet, PlusCircle, Swords, Sparkles } from 'lucide-react';
import { WeatherPill, WeatherMode } from './WeatherBackground';

export type ActiveTab = 'optimizer' | 'simulator' | 'pokedex' | 'recipes' | 'excel' | 'add';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pokemonCount: number;
  currentWeather: WeatherMode;
  onWeatherChange: (mode: WeatherMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pokemonCount,
  currentWeather,
  onWeatherChange
}) => {
  const tabs = [
    { id: 'optimizer' as ActiveTab, label: 'Optimizador', shortLabel: 'Equipo', icon: Zap, badge: 'Snorlax' },
    { id: 'simulator' as ActiveTab, label: 'Laboratorio Vs', shortLabel: 'Simulador', icon: Swords, badge: 'Vs' },
    { id: 'pokedex' as ActiveTab, label: 'Mi Pokédex', shortLabel: 'Pokédex', icon: BookOpen, count: pokemonCount },
    { id: 'recipes' as ActiveTab, label: 'Recetario', shortLabel: 'Recetas', icon: Utensils },
    { id: 'excel' as ActiveTab, label: 'Base de Datos', shortLabel: 'Excel', icon: FileSpreadsheet },
    { id: 'add' as ActiveTab, label: 'Registrar', shortLabel: '+ Pkmn', icon: PlusCircle }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#08182d]/90 backdrop-blur-md border-b border-sky-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Snorlax Sleep Master Title */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setActiveTab('optimizer')}
            >
              {/* Iconic Pokéball Graphic */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center p-0.5 shadow-md group-hover:scale-105 transition-transform relative overflow-hidden flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-7 h-7 drop-shadow-md">
                  <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
                  <path d="M 2,50 A 48,48 0 0,1 98,50 Z" fill="#EE1515" />
                  <path d="M 2,50 A 48,48 0 0,0 98,50 Z" fill="#F8FAFC" />
                  <rect x="2" y="46" width="96" height="8" fill="#0F172A" />
                  <circle cx="50" cy="50" r="15" fill="#0F172A" />
                  <circle cx="50" cy="50" r="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                  <circle cx="50" cy="50" r="5" fill="#EE1515" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                  <span>Pokémon Sleep</span>
                  <span className="text-sky-400 font-black">Master</span>
                </h1>
                <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                  Optimizador de vigor, recetas y rangos semanales
                </p>
              </div>
            </div>

            {/* Desktop Navigation Pills */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#0a203a]/90 p-1 rounded-full border border-sky-400/20 shadow-inner">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-slate-950/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Weather Atmosphere Switcher */}
              <WeatherPill currentWeather={currentWeather} onSelectWeather={onWeatherChange} />

              {/* Mobile Pokemon Count Pill */}
              <div className="flex items-center">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0a203a] text-sky-300 border border-sky-400/20 shadow-sm font-mono">
                  {pokemonCount} 🐾
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Outside header so position:fixed is relative to window viewport!) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 py-1.5 px-2 shadow-2xl safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  isActive ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate">{tab.shortLabel || tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
