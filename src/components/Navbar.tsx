import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Tab index mapping (treats 'excel' as part of 'pokedex' / Mi Caja tab)
  const tabIndexMap: Record<ActiveTab, number> = {
    optimizer: 0,
    simulator: 1,
    pokedex: 2,
    recipes: 3,
    excel: 2
  };
  const effectiveActiveIndex = tabIndexMap[activeTab] ?? 0;

  // Desktop sliding indicator pill position
  const desktopTabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [desktopPillStyle, setDesktopPillStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false
  });

  const updateDesktopPill = useCallback(() => {
    const el = desktopTabsRef.current[effectiveActiveIndex];
    if (el) {
      setDesktopPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        ready: true
      });
    }
  }, [effectiveActiveIndex]);

  useEffect(() => {
    updateDesktopPill();
    window.addEventListener('resize', updateDesktopPill);
    return () => window.removeEventListener('resize', updateDesktopPill);
  }, [updateDesktopPill]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-indigo-950/40 backdrop-blur-2xl border-b border-white/10 shadow-lg transition-colors duration-500 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Snorlax Sleep Master Title */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setActiveTab('optimizer')}
            >
              {/* Iconic Pokéball Graphic */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-indigo-950/80 border border-white/15 flex items-center justify-center p-0.5 shadow-md group-hover:scale-105 transition-transform relative overflow-hidden flex-shrink-0">
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

            {/* Desktop Navigation Pills with Smooth Sliding Luminous Capsule */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-inner relative">
              {desktopPillStyle.ready && (
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-full btn-dreamy-pearl shadow-lg pointer-events-none sliding-pill-spring"
                  style={{
                    left: `${desktopPillStyle.left}px`,
                    width: `${desktopPillStyle.width}px`,
                  }}
                />
              )}
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id || (tab.id === 'pokedex' && activeTab === 'excel');
                return (
                  <button
                    key={tab.id}
                    ref={(el) => { desktopTabsRef.current[idx] = el; }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display font-bold transition-colors duration-200 ${
                      isActive
                        ? 'text-indigo-950 font-black'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 stroke-[2.2] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-black transition-colors duration-200 ${
                        isActive ? 'bg-indigo-950/15 text-indigo-950 font-black' : 'bg-white/10 text-white'
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
                <span className="text-xs font-display font-bold px-3 py-1 rounded-full bg-white/[0.06] text-white border border-white/10 shadow-sm whitespace-nowrap">
                  {pokemonCount} 🐾
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dreamy Mobile Bottom Navigation Dock with Sliding Focus Capsule */}
      <nav className="lg:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 max-w-md mx-auto bg-indigo-950/80 backdrop-blur-2xl rounded-full border border-white/15 p-1.5 shadow-2xl">
        <div className="relative grid grid-cols-4 items-center">
          {/* Sliding Pill Indicator for Active Tab (Smooth Glide Physics) */}
          {effectiveActiveIndex >= 0 && (
            <div
              className="absolute inset-y-0 rounded-full bg-white/20 border border-white/25 shadow-lg backdrop-blur-md pointer-events-none sliding-pill-spring"
              style={{
                width: '25%',
                transform: `translateX(${effectiveActiveIndex * 100}%)`,
              }}
            />
          )}

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'pokedex' && activeTab === 'excel');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex flex-col items-center justify-center min-h-[46px] py-1 px-1 rounded-full select-none transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? 'scale-110 -translate-y-0.5 stroke-[2.4] text-white'
                        : 'scale-100 translate-y-0 stroke-[1.8] text-slate-400'
                    }`}
                  />
                  {tab.count !== undefined && (
                    <span
                      className={`absolute -top-1 -right-2 text-[8px] tabular-nums font-black px-1 rounded-full leading-none py-0.5 transition-all duration-300 ${
                        isActive
                          ? 'bg-[var(--accent-primary)] text-slate-950 shadow-sm scale-105'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-display mt-0.5 truncate tracking-tight transition-all duration-200 ${
                    isActive ? 'font-bold text-white scale-[1.02]' : 'font-medium text-slate-400'
                  }`}
                >
                  {tab.shortLabel || tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

