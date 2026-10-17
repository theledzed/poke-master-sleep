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
      {/* COMPACT CAMP SUMMARY BAR (No more scrolling on mobile!) */}
      <div className="poke-card p-3.5 sm:p-4 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          {/* Snorlax Island & Conditions summary */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
              <span>⛺</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white text-sm sm:text-base tracking-tight truncate">
                  {currentIsland.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  +{config.areaBonus || 0}% Zona
                </span>
                {config.goodCampTicket && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
                    🏕️ Pase
                  </span>
                )}
              </div>

              {/* Badges: Menu + Pot + 3 Berries */}
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-bold text-slate-200 bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-400/20">
                  <span>{dishEmoji}</span>
                  <span>{dishLabel}</span>
                </span>

                <span className="font-mono text-slate-300 font-bold bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-400/20">
                  Olla: <strong className="text-sky-300">{effectivePot}</strong>
                </span>

                {/* 3 Berries */}
                <div className="flex items-center gap-1.5 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-400/20">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#091f3a] hover:bg-sky-500/20 border border-sky-400/25 text-sky-300 hover:text-white text-xs font-bold transition-all shadow-sm"
              title="Abrir asistente de configuración semanal de Snorlax"
            >
              <Settings2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Ajustar Snorlax</span>
            </button>

            <button
              onClick={onRunOptimizer}
              disabled={isCalculating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50"
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
          <div className="poke-card pokeball-watermark rounded-3xl w-full max-w-xl shadow-2xl relative my-auto overflow-hidden border border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#080C16]/80 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl flex-shrink-0">
                  <span>⛺</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
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
            <div className="px-5 pt-4 pb-2 bg-[#080C16]/40 flex items-center justify-between relative z-10">
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
                        ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/30'
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
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-sky-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                              ? 'bg-gradient-to-b from-sky-400/25 via-white/5 to-white/5 border-sky-400 text-white shadow-lg shadow-sky-500/10'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                            isSelected ? 'bg-sky-400 text-slate-950 font-black' : 'bg-white/10 text-slate-300'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider">{dish.label}</span>
                          {isSelected && <span className="text-[10px] text-sky-300 font-bold">✓ Seleccionado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: 3 BAYAS FAVORITAS */}
              {step === 3 && (
                <div>
                  <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-1.5">
                    3. Las 3 Bayas Favoritas de tu Snorlax (×2 Vigor)
                  </label>
                  {currentIsland.fixedBerries.length === 3 ? (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 mb-2">
                      ✨ Esta isla tiene bayas fijas fijadas por el juego.
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 mb-2">
                      Elige las 3 bayas que Snorlax te solicitó esta semana:
                    </p>
                  )}

                  <div className="space-y-2">
                    {[0, 1, 2].map((slotIdx) => (
                      <div key={slotIdx} className="flex items-center gap-2">
                        <span className="w-6 text-slate-400 font-bold text-xs">{slotIdx + 1}.</span>
                        <select
                          value={config.favoriteBerries[slotIdx] || CANONICAL_BERRIES[0]}
                          onChange={(e) => handleBerryChange(slotIdx, e.target.value)}
                          disabled={currentIsland.fixedBerries.length === 3}
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
                        >
                          {CANONICAL_BERRIES.map(b => (
                            <option key={b} value={b} className="bg-slate-900">
                              {BERRIES[b]?.icon || '🍒'} {b} ({BERRIES[b]?.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
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
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-sky-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
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
            <div className="p-4 border-t border-sky-400/20 bg-[#091f3a]/90 flex items-center justify-between relative z-10">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1) as any)}
                disabled={step === 1}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-sky-400/20 text-slate-300 text-xs font-bold transition-all disabled:opacity-30"
              >
                Anterior
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(4, s + 1) as any)}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
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
