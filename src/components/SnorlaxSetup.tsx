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
      {/* COMPACT CAMP SUMMARY BAR (Cozy Field Journal Header with Campsite Diorama) */}
      <div className="cozy-card p-3.5 sm:p-4 rounded-3xl relative overflow-hidden">
        {/* Campsite Diorama SVG Silhouette Background */}
        <div className="absolute right-0 bottom-0 h-full w-72 sm:w-96 pointer-events-none select-none opacity-[0.07] text-amber-200 overflow-hidden">
          <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            {/* Rolling Hills */}
            <path d="M0 120 Q 90 70 210 95 T 400 80 L 400 120 L 0 120 Z" fill="currentColor" opacity="0.6" />
            <path d="M70 120 Q 180 50 290 80 T 400 65 L 400 120 L 70 120 Z" fill="currentColor" opacity="0.4" />
            {/* Pine Trees */}
            <path d="M340 75 L350 95 L330 95 Z M340 65 L348 80 L332 80 Z M340 55 L346 68 L334 68 Z" fill="currentColor" />
            <path d="M365 78 L373 95 L357 95 Z M365 69 L371 82 L359 82 Z" fill="currentColor" />
            <path d="M310 82 L318 98 L302 98 Z M310 73 L316 85 L304 85 Z" fill="currentColor" />
            {/* Cozy Tent */}
            <path d="M230 98 L252 62 L274 98 Z" fill="currentColor" />
            <path d="M252 62 L252 98 L262 98 Z" fill="#000" opacity="0.3" />
            <path d="M246 98 L252 75 L258 98 Z" fill="#000" opacity="0.5" />
            {/* Campfire */}
            <path d="M210 97 L216 93 L222 97 L216 95 Z" fill="currentColor" />
            <circle cx="216" cy="90" r="4" fill="#F59E0B" opacity="0.8" />
            <circle cx="216" cy="88" r="2" fill="#FDE68A" />
            {/* Stars & Moon */}
            <circle cx="370" cy="30" r="1.5" fill="currentColor" />
            <circle cx="340" cy="22" r="1" fill="currentColor" />
            <circle cx="280" cy="35" r="1.2" fill="currentColor" />
            <path d="M305 20 A 7 7 0 0 0 312 27 A 8 8 0 1 1 305 20 Z" fill="currentColor" opacity="0.7" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          {/* Snorlax Island & Conditions summary */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)] flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
              <span>⛺</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-[var(--text-heading)] text-sm sm:text-base tracking-tight truncate">
                  {currentIsland.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[var(--surface-inner)] text-[var(--accent-primary)] border border-[var(--surface-border)]">
                  +{config.areaBonus || 0}% Zona
                </span>
                {config.goodCampTicket && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    🏕️ Pase
                  </span>
                )}
              </div>

              {/* Badges: Menu + Pot + 3 Berries */}
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-200 bg-[var(--surface-inner)] px-2.5 py-0.5 rounded-lg border border-[var(--surface-border)]">
                  <span>{dishEmoji}</span>
                  <span>{dishLabel}</span>
                </span>

                <span className="tabular-nums text-[var(--text-creamy)] font-bold bg-[var(--surface-inner)] px-2.5 py-0.5 rounded-lg border border-[var(--surface-border)]">
                  Olla: <strong className="text-amber-300 tabular-nums">{effectivePot}</strong>
                </span>

                {/* 3 Berries */}
                <div className="flex items-center gap-1.5 bg-[var(--surface-inner)] px-2 py-0.5 rounded-lg border border-[var(--surface-border)]">
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

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
            <button
              onClick={() => {
                setStep(1);
                setIsStepperOpen(true);
              }}
              className="btn-cozy-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
              title="Abrir asistente de configuración semanal de Snorlax"
            >
              <Settings2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Ajustar Snorlax</span>
            </button>

            <button
              onClick={onRunOptimizer}
              disabled={isCalculating}
              className="btn-cozy-primary px-5 py-2 text-xs flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 stroke-[2.5] ${isCalculating ? 'animate-spin' : ''}`} />
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
            <div className="px-5 pt-4 pb-2 bg-[var(--surface-inner)] flex items-center justify-between relative z-10 border-b border-[var(--surface-border)]">
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
                <div className="space-y-3">
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
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-amber-300 tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                <div>
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
                              ? 'bg-[var(--surface-inner)] border-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-glow)] ring-2 ring-[var(--accent-primary)]/40'
                              : 'bg-[var(--surface-inner)] border-[var(--surface-border)] text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                            isSelected ? 'bg-[var(--accent-primary)] text-slate-950 font-black' : 'bg-white/10 text-slate-300'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider">{dish.label}</span>
                          {isSelected && <span className="text-[10px] text-[var(--accent-primary)] font-bold">✓ Seleccionado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: 3 BAYAS FAVORITAS (Visual High-Res Berry Grid) */}
              {step === 3 && (
                <div className="space-y-3.5">
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
                              ? 'bg-[var(--surface-inner)] border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-glow)] ring-2 ring-[var(--accent-primary)]/40'
                              : 'bg-[var(--surface-inner)] border-[var(--surface-border)] hover:border-white/20'
                          } ${isFixed ? 'opacity-90 cursor-default' : 'cursor-pointer active:scale-95'}`}
                        >
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                            <span>Ranura #{slotIdx + 1}</span>
                            {isSelectedSlot && !isFixed && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
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
                        <span className="text-[10px] text-amber-300 tabular-nums font-bold">
                          18 Tipos Oficiales
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)]">
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
                                  ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-white shadow-md ring-1 ring-[var(--accent-primary)]'
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
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5">
                      Capacidad Base del Puchero
                    </label>
                    <select
                      value={config.potSize}
                      onChange={(e) => onChangeConfig({ ...config, potSize: parseInt(e.target.value, 10) })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-amber-300 tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
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
