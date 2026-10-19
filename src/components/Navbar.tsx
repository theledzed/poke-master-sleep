import React from 'react';
import {
  Tent,
  BookOpen,
  UtensilsCrossed,
  FileSpreadsheet,
  Swords,
  Sparkles
} from 'lucide-react';
import { WeatherMode } from './WeatherBackground';
import { ProfileSelector } from './ProfileSelector';
import { ViewSettingsDropdown, CardViewMode } from './ViewSettingsDropdown';
import { ProfileId, SyncStatus } from '../services/supabase';
import { SpriteStyle } from '../services/pokeApiService';

export type ActiveTab = 'optimizer' | 'simulator' | 'pokedex' | 'recipes' | 'excel';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pokemonCount: number;
  currentWeather: WeatherMode;
  onWeatherChange: (mode: WeatherMode) => void;
  activeProfile: ProfileId;
  onSelectProfile: (id: ProfileId) => void;
  syncStatus: SyncStatus;
  spriteStyle: SpriteStyle;
  onSpriteStyleChange: (style: SpriteStyle) => void;
  cardViewMode: CardViewMode;
  onCardViewModeChange: (mode: CardViewMode) => void;
  pokedexViewMode?: 'cards' | 'audit';
  onPokedexViewModeChange?: (mode: 'cards' | 'audit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pokemonCount,
  currentWeather,
  onWeatherChange,
  activeProfile,
  onSelectProfile,
  syncStatus,
  spriteStyle,
  onSpriteStyleChange,
  cardViewMode,
  onCardViewModeChange,
  pokedexViewMode,
  onPokedexViewModeChange
}) => {
  const tabs = [
    { id: 'optimizer' as ActiveTab, label: 'Campamento', shortLabel: 'Campamento', icon: Tent, badge: 'Snorlax' },
    { id: 'simulator' as ActiveTab, label: 'Simulador Vs', shortLabel: 'Simulador', icon: Swords, badge: 'Vs' },
    { id: 'pokedex' as ActiveTab, label: 'Mi Caja', shortLabel: 'Mi Caja', icon: BookOpen, count: pokemonCount },
    { id: 'recipes' as ActiveTab, label: 'Recetario', shortLabel: 'Recetas', icon: UtensilsCrossed },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--surface-card)]/90 backdrop-blur-md border-b border-[var(--surface-border)] shadow-md transition-colors duration-500">
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
                <h1 className="font-display font-bold text-sm sm:text-base text-[var(--text-heading)] tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                  <span>Pokémon Sleep</span>
                  <span className="text-[var(--accent-primary)] font-black">Master</span>
                </h1>
                <p className="text-[10px] text-slate-300 hidden sm:block truncate font-medium">
                  Optimizador de vigor, recetas y rangos semanales
                </p>
              </div>
            </div>

            {/* Desktop Navigation Pills */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-[var(--surface-inner)] p-1.5 rounded-full border border-[var(--surface-border)] shadow-inner">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display font-bold transition-all ${
                      isActive
                        ? 'btn-cozy-primary scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-black ${
                        isActive ? 'bg-black/20 text-white' : 'bg-black/30 text-amber-200'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Modular Profile Selector with Cloud Sync */}
              <ProfileSelector
                activeProfile={activeProfile}
                onSelectProfile={onSelectProfile}
                syncStatus={syncStatus}
              />

              {/* Unified Interface & Display Settings (Sprites, Cards & Weather Atmosphere) */}
              <ViewSettingsDropdown
                spriteStyle={spriteStyle}
                onSelectSpriteStyle={onSpriteStyleChange}
                cardViewMode={cardViewMode}
                onSelectCardViewMode={onCardViewModeChange}
                activeTab={activeTab}
                pokedexViewMode={pokedexViewMode}
                onSelectPokedexViewMode={onPokedexViewModeChange}
                currentWeather={currentWeather}
                onSelectWeather={onWeatherChange}
              />

              {/* Mobile/Desktop Pokemon Count Pill */}
              <div className="hidden xs:flex items-center">
                <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full bg-[var(--surface-inner)] text-[var(--accent-primary)] border border-[var(--surface-border)] shadow-sm whitespace-nowrap">
                  {pokemonCount} 🐾
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cozy Mobile Bottom Navigation Dock (Floating Island, Fitts' law 44px+ touch targets) */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto bg-[var(--surface-card)]/95 backdrop-blur-2xl rounded-2xl border border-[var(--surface-border)] p-1.5 shadow-2xl safe-area-pb transition-all">
        <div className="grid grid-cols-4 gap-1 items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-1 rounded-xl transition-all select-none ${
                  isActive
                    ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-display font-bold border border-[var(--border-specular)] shadow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  {tab.count !== undefined && (
                    <span className="absolute -top-1 -right-2 text-[8px] tabular-nums font-black bg-[var(--accent-primary)] text-slate-950 px-1 rounded-full leading-none py-0.5">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-display font-bold mt-0.5 truncate tracking-tight">{tab.shortLabel || tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
