import React, { useState } from 'react';
import { SnorlaxConfig, DishType } from '../types/pokemon';
import { ISLANDS, BERRIES, POT_SIZES, CANONICAL_BERRIES } from '../data/gameData';
import { getBerrySpriteUrl, getRankPokeballUrl } from '../services/pokeApiService';
import {
  Sparkles,
  MapPin,
  Salad,
  Coffee,
  Soup,
  Calendar,
  Settings2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Tent,
  Zap,
  RotateCcw
} from 'lucide-react';

interface SnorlaxSetupProps {
  config: SnorlaxConfig;
  onChangeConfig: (newConfig: SnorlaxConfig) => void;
  onRunOptimizer: () => void;
  isCalculating: boolean;
}

export const SnorlaxSetup: React.FC<SnorlaxSetupProps> = ({
  config,
  onChangeConfig,
  onRunOptimizer,
  isCalculating
}) => {
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeBerrySlot, setActiveBerrySlot] = useState<number>(0);

  const currentIsland = ISLANDS.find(i => i.id === config.island) || ISLANDS[0];

  const handleIslandChange = (islandId: string) => {
    const selected = ISLANDS.find(i => i.id === islandId);
    if (!selected) return;

    if (selected.fixedBerries.length === 3) {
      onChangeConfig({
        ...config,
        island: islandId,
        favoriteBerries: [...selected.fixedBerries]
      });
    } else {
      onChangeConfig({
        ...config,
        island: islandId
      });
    }
  };

  const handleBerryChange = (index: number, berryName: string) => {
    const newBerries = [...config.favoriteBerries];
    newBerries[index] = berryName;
    onChangeConfig({
      ...config,
      favoriteBerries: newBerries
    });
  };

  const dishTypes: { id: DishType; label: string; icon: any }[] = [
    { id: 'curry', label: 'Guisos y Curris', icon: Soup },
    { id: 'salad', label: 'Ensaladas', icon: Salad },
    { id: 'dessert', label: 'Postres y Bebidas', icon: Coffee }
  ];

  const dishEmoji = config.dishType === 'curry' ? '🍲' : config.dishType === 'salad' ? '🥗' : '☕';
  const dishLabel = config.dishType === 'curry' ? 'Curris' : config.dishType === 'salad' ? 'Ensaladas' : 'Postres';

  const effectivePot = config.goodCampTicket
    ? Math.floor(config.potSize * 1.5)
    : config.potSize;

  return (
    <>
      {/* COMPACT CAMP SUMMARY BAR (Dreamy Ethereal Island Header with Moonlit Scene) */}
      <div className="glass-dreamy p-4 sm:p-5 rounded-[28px] relative overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(8,10,30,0.45)]">
        {/* Dreamy Ambient Light Glow */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none opacity-40" />

        {/* Ethereal Night / Moonlit Scene SVG in Layers (Good Night 22:30 Style) */}
        <div className="absolute right-0 bottom-0 h-full w-80 sm:w-[440px] pointer-events-none select-none overflow-hidden opacity-30 text-purple-200">
          <svg viewBox="0 0 440 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <defs>
              <filter id="dreamy-moon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="hill-grad-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="hill-grad-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Distant Soft Rolling Hills */}
            <path d="M0 140 Q 110 75 240 100 T 440 85 L 440 140 L 0 140 Z" fill="url(#hill-grad-1)" />
            <path d="M80 140 Q 200 60 320 90 T 440 70 L 440 140 L 80 140 Z" fill="url(#hill-grad-2)" />

            {/* Glowing Luminous Crescent Moon */}
            <g transform="translate(350, 18)" filter="url(#dreamy-moon-glow)">
              <circle cx="16" cy="16" r="14" fill="#FFFFFF" opacity="0.12" />
              <path
                d="M 18,3 A 14,14 0 0,0 29,18 A 15,15 0 1,1 18,3 Z"
                fill="#FFFDF7"
                opacity="0.9"
              />
            </g>

            {/* Soft Floating Cloud Silhouettes */}
            <path
              d="M 230 48 Q 240 40 252 44 Q 262 38 274 44 Q 284 42 290 50 Q 295 56 290 62 L 225 62 Q 220 56 230 48 Z"
              fill="#FFFFFF"
              opacity="0.18"
            />
            <path
              d="M 310 52 Q 320 45 330 49 Q 340 44 350 50 Q 358 48 364 55 Q 368 60 364 66 L 305 66 Q 300 60 310 52 Z"
              fill="#FFFFFF"
              opacity="0.12"
            />

            {/* 4-Point Stars (✦) and Delicate Twinkles */}
            <text x="315" y="26" fill="#FFFFFF" fontSize="12" opacity="0.8">✦</text>
            <text x="270" y="38" fill="#FDE68A" fontSize="9" opacity="0.75">✦</text>
            <text x="395" y="45" fill="#FBCFE8" fontSize="11" opacity="0.8">✦</text>
            <circle cx="295" cy="22" r="1" fill="#FFFFFF" opacity="0.7" />
            <circle cx="340" cy="42" r="1.2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="245" cy="30" r="1" fill="#FFFFFF" opacity="0.6" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          {/* Snorlax Island & Conditions summary */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              <span>⛺</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-[var(--text-heading)] text-sm sm:text-base tracking-tight truncate">
                  {currentIsland.name}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[var(--accent-primary)] border border-white/10 backdrop-blur-md">
                  +{config.areaBonus || 0}% Zona
                </span>
                {config.goodCampTicket && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-300/30 backdrop-blur-md">
                    🏕️ Pase
                  </span>
                )}
              </div>

              {/* Badges: Menu + Pot + 3 Berries */}
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-100 bg-white/[0.06] backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10">
                  <span>{dishEmoji}</span>
                  <span>{dishLabel}</span>
                </span>

                <span className="tabular-nums text-[var(--text-creamy)] font-bold bg-white/[0.06] backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10">
                  Olla: <strong className="text-white tabular-nums">{effectivePot}</strong>
                </span>

                {/* 3 Berries in soft translucent pill */}
                <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  {config.favoriteBerries.map((b, idx) => (
                    <img
                      key={idx}
                      src={getBerrySpriteUrl(b)}
                      alt={b}
                      title={`${b} (×2 Vigor)`}
                      className="w-4 h-4 object-contain filter drop-shadow"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Dreamy Luminous Pearl & Frosted Ghost Pills) */}
          <div className="flex items-center gap-2.5 self-end md:self-auto flex-shrink-0">
            <button
              onClick={() => {
                setStep(1);
                setIsStepperOpen(true);
              }}
              className="btn-dreamy-ghost px-4 py-2 text-xs flex items-center gap-1.5 rounded-full shadow-sm"
              title="Abrir asistente de configuración semanal de Snorlax"
            >
              <Settings2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Ajustar Snorlax</span>
            </button>

            <button
              onClick={onRunOptimizer}
              disabled={isCalculating}
              className="btn-dreamy-pearl px-5 py-2.5 text-xs flex items-center gap-1.5 rounded-full disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 stroke-[2.2] text-indigo-950 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Calculando...' : 'Optimizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE 4-STEP WIZARD MODAL */}
      {isStepperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="cozy-card pokeball-watermark rounded-3xl w-full max-w-xl shadow-2xl relative my-auto overflow-hidden border border-[var(--surface-border)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)] bg-[var(--surface-card)] relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)] flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
                  <span>⛺</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-[var(--text-heading)]">
                    Asistente de Campamento Snorlax
                  </h3>
                  <p className="text-xs text-slate-300">
                    Paso {step} de 4: {step === 1 ? 'Isla & Bonus' : step === 2 ? 'Menú Culinario' : step === 3 ? 'Bayas Favoritas' : 'Puchero & Pase'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStepperOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="px-5 pt-4 pb-2 bg-white/[0.04] flex items-center justify-between relative z-10 border-b border-white/10">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  onClick={() => setStep(s as any)}
                  className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    step === s ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      step === s
                        ? 'bg-[var(--accent-primary)] text-slate-950 shadow-md shadow-[var(--accent-glow)]'
                        : step > s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    {s === 1 ? 'Isla' : s === 2 ? 'Menú' : s === 3 ? 'Bayas' : 'Puchero'}
                  </span>
                </div>
              ))}
            </div>

            {/* Stepper Body Content */}
            <div className="p-5 space-y-4 relative z-10 min-h-[220px]">
              {/* STEP 1: ISLA & BONUS */}
              {step === 1 && (
                <div key={1} className="space-y-3 animate-dreamy-tab-enter">
                  <div>
                    <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5">
                      1. ¿En qué Isla estás acampando esta semana?
                    </label>
                    <select
                      value={config.island}
                      onChange={(e) => handleIslandChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      {ISLANDS.map(island => (
                        <option key={island.id} value={island.id} className="bg-slate-900">
                          {island.name} {island.fixedBerries.length === 3 ? '(3 Bayas Fijas)' : '(Bayas Aleatorias)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5">
                      Bonus de Área acumulado en esta Isla
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={config.areaBonus || 0}
                        onChange={(e) => onChangeConfig({ ...config, areaBonus: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75].map(b => (
                          <option key={b} value={b} className="bg-slate-900">
                            +{b}% de Bonus de Área
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MENU CULINARIO */}
              {step === 2 && (
                <div key={2} className="animate-dreamy-tab-enter">
                  <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-2">
                    2. ¿Qué tipo de plato pide tu Snorlax?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {dishTypes.map((dish) => {
                      const Icon = dish.icon;
                      const isSelected = config.dishType === dish.id;
                      return (
                        <button
                          key={dish.id}
                          onClick={() => onChangeConfig({ ...config, dishType: dish.id })}
                          className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-white/10 border-purple-400/50 text-white shadow-lg ring-2 ring-purple-400/40'
                              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                            isSelected ? 'bg-white text-indigo-950 font-black' : 'bg-white/10 text-slate-300'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider">{dish.label}</span>
                          {isSelected && <span className="text-[10px] text-purple-200 font-bold">✓ Seleccionado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: 3 BAYAS FAVORITAS (Visual High-Res Berry Grid) */}
              {step === 3 && (
                <div key={3} className="space-y-3.5 animate-dreamy-tab-enter">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider">
                      3. Las 3 Bayas Favoritas de tu Snorlax (×2 Vigor)
                    </label>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {currentIsland.fixedBerries.length === 3
                        ? '✨ Esta isla cuenta con 3 bayas fijas predeterminadas por el juego.'
                        : 'Toca una ranura y selecciona su baya con arte oficial:'}
                    </p>
                  </div>

                  {/* 3 Berry Slots Display */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[0, 1, 2].map((slotIdx) => {
                      const berryName = config.favoriteBerries[slotIdx] || CANONICAL_BERRIES[slotIdx] || 'Baya Zanama';
                      const berryMeta = BERRIES[berryName];
                      const isSelectedSlot = activeBerrySlot === slotIdx;
                      const isFixed = currentIsland.fixedBerries.length === 3;

                      return (
                        <button
                          key={slotIdx}
                          type="button"
                          disabled={isFixed}
                          onClick={() => setActiveBerrySlot(slotIdx)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all relative ${
                            isSelectedSlot && !isFixed
                              ? 'bg-white/10 border-purple-400/50 shadow-lg ring-2 ring-purple-400/40'
                              : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                          } ${isFixed ? 'opacity-90 cursor-default' : 'cursor-pointer active:scale-95'}`}
                        >
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                            <span>Ranura #{slotIdx + 1}</span>
                            {isSelectedSlot && !isFixed && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            )}
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-black/25 flex items-center justify-center p-1 my-0.5">
                            <img
                              src={getBerrySpriteUrl(berryName)}
                              alt={berryName}
                              className="w-10 h-10 object-contain filter drop-shadow"
                            />
                          </div>

                          <span className="text-xs font-bold text-white truncate max-w-full mt-1">
                            {berryName.replace('Baya ', '')}
                          </span>

                          <span className="text-[10px] font-semibold text-slate-300 mt-0.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                            {berryMeta?.type || 'Normal'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Berry Picker Grid (Only shown when not fixed island) */}
                  {currentIsland.fixedBerries.length !== 3 ? (
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <span>🍒</span>
                          <span>Elige baya para Ranura #{activeBerrySlot + 1}:</span>
                        </span>
                        <span className="text-[10px] text-purple-200 tabular-nums font-bold">
                          18 Tipos Oficiales
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-white/[0.04] border border-white/10">
                        {CANONICAL_BERRIES.map((b) => {
                          const meta = BERRIES[b];
                          const isCurrentSlotBerry = config.favoriteBerries[activeBerrySlot] === b;

                          return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => {
                                handleBerryChange(activeBerrySlot, b);
                                if (activeBerrySlot < 2) {
                                  setActiveBerrySlot(activeBerrySlot + 1);
                                }
                              }}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                isCurrentSlotBerry
                                  ? 'bg-purple-500/20 border-purple-400 text-white shadow-md ring-1 ring-purple-400'
                                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                              } active:scale-95`}
                            >
                              <img
                                src={getBerrySpriteUrl(b)}
                                alt={b}
                                className="w-8 h-8 object-contain filter drop-shadow"
                                loading="lazy"
                              />
                              <span className="text-[11px] font-bold truncate max-w-full leading-tight">
                                {b.replace('Baya ', '')}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                {meta?.type}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                      <span>🔒</span>
                      <span>
                        En <strong>{currentIsland.name}</strong> las 3 bayas favoritas están fijadas por la naturaleza de la isla y no pueden ser modificadas.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: PUCHERO & PASE DE ACAMPADA */}
              {step === 4 && (
                <div key={4} className="space-y-3.5 animate-dreamy-tab-enter">
                  <div>
                    <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5">
                      Capacidad Base del Puchero
                    </label>
                    <select
                      value={config.potSize}
                      onChange={(e) => onChangeConfig({ ...config, potSize: parseInt(e.target.value, 10) })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {POT_SIZES.map(size => (
                        <option key={size} value={size} className="bg-slate-900">
                          {size} ingredientes base {config.goodCampTicket ? `(se expande a ${Math.floor(size * 1.5)} con Pase)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Good Camp Ticket Toggle */}
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <div>
                      <span className="font-bold text-white text-xs block">
                        🏕️ Pase de Buen Campamento
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Expande la olla en +50% y otorga +20% velocidad de ayuda a todo tu equipo.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(config.goodCampTicket)}
                      onChange={(e) => onChangeConfig({ ...config, goodCampTicket: e.target.checked })}
                      className="w-5 h-5 rounded accent-sky-400 cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Stepper Footer Buttons */}
            <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--surface-inner)] flex items-center justify-between relative z-10">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1) as any)}
                disabled={step === 1}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--surface-border)] text-slate-300 text-xs font-bold transition-all disabled:opacity-30"
              >
                Anterior
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(4, s + 1) as any)}
                  className="btn-cozy-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsStepperOpen(false);
                    onRunOptimizer();
                  }}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Guardar y Optimizar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
