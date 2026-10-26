import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Calendar, Ghost, Candy, Info, CheckCircle2 } from 'lucide-react';
import { SnorlaxConfig } from '../types/pokemon';
import { getBerrySpriteUrl } from '../services/pokeApiService';

interface HalloweenEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SnorlaxConfig;
  onChangeConfig: (newConfig: SnorlaxConfig) => void;
}

export const HalloweenEventModal: React.FC<HalloweenEventModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig
}) => {
  if (!isOpen) return null;

  const isEventEnabled = config.halloweenEventActive !== false;
  const hasOramFavorite = config.favoriteBerries.some(b => b.trim() === 'Baya Oram');
  const isGreengrass = !config.island || config.island === 'greengrass';

  const handleToggleEvent = () => {
    onChangeConfig({
      ...config,
      halloweenEventActive: !isEventEnabled
    });
  };

  const handleSetOramBerry = () => {
    const nextBerries = [...config.favoriteBerries];
    if (nextBerries.length === 0) {
      nextBerries.push('Baya Oram');
    } else {
      nextBerries[0] = 'Baya Oram';
    }
    onChangeConfig({
      ...config,
      favoriteBerries: nextBerries
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="glass-dreamy rounded-[32px] border border-orange-500/30 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto overflow-hidden bg-gradient-to-br from-orange-950/90 via-purple-950/95 to-slate-950/95 animate-dreamy-tab-enter">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.03] backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-purple-600/30 border border-orange-400/40 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              <span>🎃</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-display font-black text-white tracking-tight">
                  Halloween 2026: Doble Dulce
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-400/30">
                  En curso
                </span>
              </div>
              <p className="text-xs text-orange-200/70 mt-0.5">
                Del lun. 26 de oct. (04:00) al lun. 2 de nov. (03:59) en Isla Verdegal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto relative z-10 custom-scrollbar text-xs sm:text-sm">
          {/* Quick Actions & Switch */}
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>⚡ Bonus en Cálculos del Optimizador</span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Aplica +1 ingrediente, x1,25 de activación y +3 niveles de habilidad a los tipo Fantasma.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={handleToggleEvent}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isEventEnabled
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {isEventEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                <span>{isEventEnabled ? 'Bonus Activo' : 'Bonus Desactivado'}</span>
              </button>
            </div>
          </div>

          {/* Snorlax Oram Berry Pin Action */}
          {isGreengrass && !hasOramFavorite && (
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={getBerrySpriteUrl('Baya Oram')}
                  alt="Baya Oram"
                  className="w-7 h-7 object-contain drop-shadow"
                />
                <div>
                  <div className="font-bold text-purple-100 text-xs sm:text-sm">
                    Snorlax tiene Baya Oram garantizada
                  </div>
                  <div className="text-[11px] text-purple-200/70">
                    En Isla Verdegal durante el evento, la Baya Oram (Fantasma) es fija.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSetOramBerry}
                className="btn-dreamy-ghost px-3.5 py-1.5 text-xs rounded-full font-bold text-purple-200 border-purple-400/40 hover:bg-purple-500/20 flex-shrink-0"
              >
                Fijar Baya Oram
              </button>
            </div>
          )}

          {/* Section 1: Ghost Buffs */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-orange-300">
              <Ghost className="w-4 h-4 text-orange-400" />
              <span>Super Buff a Pokémon de Tipo Fantasma</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div className="text-xl mb-1">🍲</div>
                <div>
                  <div className="font-black text-white text-sm">+1 Ingrediente</div>
                  <div className="text-xs text-white/60 mt-0.5">
                    Cada vez que un Fantasma te traiga ingredientes, trae 1 extra.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div className="text-xl mb-1">⚡</div>
                <div>
                  <div className="font-black text-white text-sm">x1,25 Activación</div>
                  <div className="text-xs text-white/60 mt-0.5">
                    Probabilidad de activar su habilidad principal multiplicada por 1,25.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div className="text-xl mb-1">⭐</div>
                <div>
                  <div className="font-black text-white text-sm">+3 Niveles de Habilidad</div>
                  <div className="text-xs text-white/60 mt-0.5">
                    Su habilidad principal sube 3 niveles al activarse (tope nivel máx).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Candy Multiplier Calendar */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-300">
              <Candy className="w-4 h-4 text-purple-400" />
              <span>Multiplicador de Caramelos (1er estudio del día)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-purple-900/30 border border-purple-400/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-200 text-xs">Halloween & Cierre</span>
                  <span className="font-black text-purple-300 text-sm px-2 py-0.5 rounded-md bg-purple-500/20">
                    x3 Caramelos 🌟
                  </span>
                </div>
                <p className="text-xs text-purple-200/80 font-medium">
                  Sábado 31 de octubre y Domingo 1 de noviembre.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">Días Regulares</span>
                  <span className="font-black text-orange-300 text-sm px-2 py-0.5 rounded-md bg-orange-500/20">
                    x2 Caramelos
                  </span>
                </div>
                <p className="text-xs text-white/60 font-medium">
                  Del lunes 26 al viernes 30 de octubre.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Spawns */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Aparición de Pokémon en Isla Verdegal</span>
            </h4>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-purple-300">🔴 Muy Alta:</span>
                <span className="text-xs text-white font-medium">
                  Eevee (Halloween - sombrero morado), Misdreavus y Mismagius
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-300">🟡 Alta:</span>
                <span className="text-xs text-white font-medium">Pikachu (Halloween)</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-emerald-300">🟢 Ligeramente Mayor:</span>
                <span className="text-xs text-white/80 font-medium">
                  Gastly, Haunter, Gengar, Shuppet, Banette, Drifloon, Drifblim, Pumpkaboo, Gourgeist, Mimikyu y Skeledirge
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Critical Rules */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-white/70">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Reglas Importantes del Evento</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
              <li>
                <strong>Los Pokémon con traje no evolucionan:</strong> Eevee con sombrero morado y Pikachu de Halloween no pueden evolucionar.
              </li>
              <li>
                <strong>Ventana extendida de inciensos:</strong> Tras terminar el evento (2 de nov.), puedes seguir atrayendo a Gengar, Drifblim, Skeledirge o los de evento usando sus inciensos hasta el <strong>9 de noviembre a las 03:59</strong>.
              </li>
              <li>
                <strong>Incienso de Eevee (Halloween):</strong> Recompensa de misiones temporales, usable desde el lunes 26 a las 15:00.
              </li>
              <li>
                <strong>Reinicio diario:</strong> El día formal del evento arranca a las <strong>04:00 AM</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex justify-end relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="btn-dreamy-pearl px-6 py-2.5 text-xs font-bold rounded-full"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
