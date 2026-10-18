import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  LayoutGrid,
  Eye,
  Sparkles,
  Layers,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Compass,
  Palette,
  SlidersHorizontal
} from 'lucide-react';
import { SpriteStyle } from '../services/pokeApiService';
import {
  WeatherMode,
  STORAGE_KEY_WEATHER,
  STORAGE_KEY_AUTO,
  getAutoWeatherByTime,
  fetchLiveWeatherFromCoords
} from './WeatherBackground';

export type CardViewMode = 'compact' | 'detailed';

interface ViewSettingsDropdownProps {
  spriteStyle: SpriteStyle;
  onSelectSpriteStyle: (style: SpriteStyle) => void;
  cardViewMode: CardViewMode;
  onSelectCardViewMode: (mode: CardViewMode) => void;
  activeTab?: string;
  pokedexViewMode?: 'cards' | 'audit';
  onSelectPokedexViewMode?: (mode: 'cards' | 'audit') => void;
  currentWeather?: WeatherMode;
  onSelectWeather?: (mode: WeatherMode) => void;
}

export const ViewSettingsDropdown: React.FC<ViewSettingsDropdownProps> = ({
  spriteStyle,
  onSelectSpriteStyle,
  cardViewMode,
  onSelectCardViewMode,
  activeTab,
  pokedexViewMode,
  onSelectPokedexViewMode,
  currentWeather = 'afternoon',
  onSelectWeather
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoWeather, setIsAutoWeather] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_AUTO) !== 'false';
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const spriteOptions: { id: SpriteStyle; label: string; desc: string; icon: string }[] = [
    {
      id: 'sleep',
      label: 'Oficial Sleep',
      desc: 'Retratos redondos oficiales del juego',
      icon: '💤'
    },
    {
      id: 'showdown',
      label: 'Animado (Showdown)',
      desc: 'Modelos 3D animados en movimiento',
      icon: '🎬'
    },
    {
      id: 'artwork',
      label: 'Arte Oficial',
      desc: 'Ilustraciones clásicas Ken Sugimori HD',
      icon: '🎨'
    }
  ];

  const weatherOptions: { mode: WeatherMode; label: string; icon: any }[] = [
    { mode: 'morning', label: 'Mañana', icon: Sun },
    { mode: 'afternoon', label: 'Tarde', icon: Sunset },
    { mode: 'night', label: 'Noche', icon: Moon },
    { mode: 'rain', label: 'Lluvia', icon: CloudRain }
  ];

  const currentSprite = spriteOptions.find(o => o.id === spriteStyle) || spriteOptions[0];
  const currentWeatherOption = weatherOptions.find(o => o.mode === currentWeather) || weatherOptions[0];
  const CurrentWeatherIcon = currentWeatherOption.icon;

  const handleManualWeather = (mode: WeatherMode) => {
    setIsAutoWeather(false);
    localStorage.setItem(STORAGE_KEY_AUTO, 'false');
    localStorage.setItem(STORAGE_KEY_WEATHER, mode);
    onSelectWeather?.(mode);
  };

  const handleEnableAutoWeather = () => {
    setIsAutoWeather(true);
    localStorage.setItem(STORAGE_KEY_AUTO, 'true');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const liveWeather = await fetchLiveWeatherFromCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          onSelectWeather?.(liveWeather);
        },
        () => {
          onSelectWeather?.(getAutoWeatherByTime());
        }
      );
    } else {
      onSelectWeather?.(getAutoWeatherByTime());
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Sleek Combined Trigger Pill: Combines Sprites & Weather in ONE unified control */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs shadow-sm transition-all flex-shrink-0 ${
          isOpen
            ? 'bg-[#0f2d50] border-sky-400/60 text-white shadow-sky-500/20 shadow-md ring-1 ring-sky-400/30'
            : 'bg-[#0a203a] hover:bg-[#0f2d50] border-sky-400/25 text-sky-200'
        }`}
        title="Personalizar interfaz: estilo de sprites, diseño de fichas y atmósfera climática"
      >
        <span className="text-xs leading-none">{currentSprite.icon}</span>
        <CurrentWeatherIcon className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <span className="text-[11px] font-bold hidden sm:inline">Interfaz</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-300' : ''
          }`}
        />
      </button>

      {/* Floating Menu with categorized sections */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 max-h-[85vh] overflow-y-auto bg-[#0c2444] border border-sky-400/30 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5 custom-scrollbar">
          {/* Main Title Header */}
          <div className="text-[10px] uppercase font-black tracking-wider text-sky-300 px-2 py-0.5 border-b border-sky-400/15 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Personalizar Interfaz</span>
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Ajustes Visuales</span>
          </div>

          {/* Section 1: Estilo de Pokémon (Sprites) */}
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center justify-between">
              <span>Estilo de Pokémon</span>
              <span className="text-[9px] text-amber-400 font-normal">En vivo</span>
            </div>
            <div className="space-y-1">
              {spriteOptions.map(opt => {
                const isSelected = spriteStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectSpriteStyle(opt.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all text-left ${
                      isSelected
                        ? 'bg-sky-500/25 text-white font-bold border border-sky-400/40 shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">{opt.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{opt.label}</div>
                        <div className="text-[9px] text-slate-400 truncate">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-400 flex-shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-sky-400/15" />

          {/* Section 2: Tamaño / Modo de Tarjetas */}
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center justify-between">
              <span>Diseño de Tarjetas</span>
              <span className="text-[9px] text-sky-300 font-normal">Equipos y Caja</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => onSelectCardViewMode('compact')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  cardViewMode === 'compact'
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compactas</span>
                {cardViewMode === 'compact' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => onSelectCardViewMode('detailed')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  cardViewMode === 'detailed'
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-white/5'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Completas</span>
                {cardViewMode === 'detailed' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* Section 3 (if on Pokedex tab): Modo de Pokédex */}
          {activeTab === 'pokedex' && onSelectPokedexViewMode && (
            <>
              <div className="h-px bg-sky-400/15" />
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center justify-between">
                  <span>Modo Mi Pokédex</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectPokedexViewMode('cards')}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                      pokedexViewMode === 'cards'
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-white/5'
                    }`}
                  >
                    <span>📋 Fichas</span>
                    {pokedexViewMode === 'cards' && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPokedexViewMode('audit')}
                    className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                      pokedexViewMode === 'audit'
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-white/5'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>🔬 Matriz</span>
                    {pokedexViewMode === 'audit' && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-sky-400/15" />

          {/* Section 4: Atmósfera & Clima Dinámico */}
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center justify-between">
              <span>Atmósfera & Clima</span>
              {isAutoWeather && (
                <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 rounded font-bold">
                  Auto Activo
                </span>
              )}
            </div>

            {/* Auto Mode Button */}
            <button
              type="button"
              onClick={handleEnableAutoWeather}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all mb-1.5 ${
                isAutoWeather
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Auto (Hora & Clima Real)</span>
              </span>
              {isAutoWeather && <Check className="w-3.5 h-3.5 text-sky-400" />}
            </button>

            {/* Manual Weather Options Grid */}
            <div className="grid grid-cols-2 gap-1">
              {weatherOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = !isAutoWeather && currentWeather === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => handleManualWeather(opt.mode)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-sm'
                        : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3] flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
