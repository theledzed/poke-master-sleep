import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sun, Sunset, Moon, CloudRain, Sparkles, Compass, Check, ChevronDown } from 'lucide-react';

export type WeatherMode = 'morning' | 'afternoon' | 'night' | 'rain';

interface WeatherBackgroundProps {
  currentWeather?: WeatherMode;
  onWeatherChange?: (mode: WeatherMode) => void;
}

export const STORAGE_KEY_WEATHER = 'sleep_master_weather_v1';
export const STORAGE_KEY_AUTO = 'sleep_master_weather_auto_v1';

/**
 * Determine atmospheric weather based on current local time
 */
export function getAutoWeatherByTime(): WeatherMode {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'afternoon';
  return 'night';
}
export function getAutoWeather(): WeatherMode {
  return getAutoWeatherByTime();
}

/**
 * Check real-time weather using Open-Meteo free API
 */
export async function fetchLiveWeatherFromCoords(lat: number, lon: number): Promise<WeatherMode> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`
    );
    if (!res.ok) return getAutoWeatherByTime();
    const data = await res.json();
    const code = data?.current?.weather_code;

    // Rain / Drizzle / Thunderstorm WMO codes
    if (
      (code >= 51 && code <= 67) || // Drizzle & Rain
      (code >= 80 && code <= 82) || // Rain showers
      (code >= 95 && code <= 99)    // Thunderstorms
    ) {
      return 'rain';
    }

    return getAutoWeatherByTime();
  } catch (e) {
    return getAutoWeatherByTime();
  }
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  currentWeather: propWeather,
  onWeatherChange
}) => {
  const [weather, setWeather] = useState<WeatherMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEATHER);
      if (saved && ['morning', 'afternoon', 'night', 'rain'].includes(saved)) {
        return saved as WeatherMode;
      }
    } catch (e) {
      // ignore
    }
    return propWeather || getAutoWeatherByTime();
  });

  const activeWeather = propWeather || weather;

  // Real-time automatic weather detection on mount
  useEffect(() => {
    const isAuto = localStorage.getItem(STORAGE_KEY_AUTO) !== 'false';
    if (!isAuto) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const liveWeather = await fetchLiveWeatherFromCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          setWeather(liveWeather);
          if (onWeatherChange) onWeatherChange(liveWeather);
        },
        () => {
          // Fallback to local clock
          const timeWeather = getAutoWeatherByTime();
          setWeather(timeWeather);
          if (onWeatherChange) onWeatherChange(timeWeather);
        },
        { timeout: 6000 }
      );
    } else {
      const timeWeather = getAutoWeatherByTime();
      setWeather(timeWeather);
      if (onWeatherChange) onWeatherChange(timeWeather);
    }
  }, []);

  // Weather atmosphere styles (Dreamy Sleep Aurora Mesh Aesthetic)
  const weatherConfig = useMemo(() => {
    switch (activeWeather) {
      case 'morning':
        return {
          label: 'Amanecer Pastel',
          icon: Sun,
          iconColor: 'text-pink-200',
          bgGradient: 'from-[#1A1638] via-[#3B1B3A] to-[#25122B]',
          orbs: [
            { bg: 'bg-pink-400/20', size: 'w-96 h-96', pos: '-top-20 -left-20', delay: '0s' },
            { bg: 'bg-indigo-300/18', size: 'w-[420px] h-[420px]', pos: 'top-10 -right-20', delay: '2s' },
            { bg: 'bg-purple-400/20', size: 'w-80 h-80', pos: 'bottom-40 left-1/3', delay: '4s' }
          ],
          starColor: 'text-pink-200/80',
          dotColor: 'bg-pink-100/60'
        };
      case 'afternoon':
        return {
          label: 'Crepúsculo Dorado',
          icon: Sunset,
          iconColor: 'text-rose-200',
          bgGradient: 'from-[#1B1032] via-[#3F1735] to-[#250D24]',
          orbs: [
            { bg: 'bg-rose-400/20', size: 'w-[420px] h-[420px]', pos: '-top-20 -right-20', delay: '0s' },
            { bg: 'bg-purple-500/18', size: 'w-96 h-96', pos: 'top-1/4 -left-20', delay: '2s' },
            { bg: 'bg-pink-500/18', size: 'w-80 h-80', pos: 'bottom-20 right-1/4', delay: '4s' }
          ],
          starColor: 'text-rose-200/80',
          dotColor: 'bg-purple-100/60'
        };
      case 'rain':
        return {
          label: 'Lluvia Serena',
          icon: CloudRain,
          iconColor: 'text-cyan-200',
          bgGradient: 'from-[#06111C] via-[#0D2633] to-[#05151F]',
          orbs: [
            { bg: 'bg-teal-400/18', size: 'w-96 h-96', pos: '-top-10 -left-10', delay: '0s' },
            { bg: 'bg-cyan-500/16', size: 'w-[400px] h-[400px]', pos: 'top-1/3 -right-20', delay: '2s' },
            { bg: 'bg-blue-600/15', size: 'w-80 h-80', pos: 'bottom-20 left-1/4', delay: '4s' }
          ],
          starColor: 'text-cyan-200/70',
          dotColor: 'bg-cyan-200/60'
        };
      case 'night':
      default:
        return {
          label: 'Noche Mágica',
          icon: Moon,
          iconColor: 'text-purple-200',
          bgGradient: 'from-[#0A0D1E] via-[#1B1842] to-[#120F2D]',
          orbs: [
            { bg: 'bg-purple-600/22', size: 'w-[460px] h-[460px]', pos: '-top-20 left-1/4', delay: '0s' },
            { bg: 'bg-pink-500/16', size: 'w-96 h-96', pos: 'top-1/3 -right-20', delay: '2s' },
            { bg: 'bg-indigo-400/18', size: 'w-96 h-96', pos: 'bottom-10 -left-10', delay: '4s' }
          ],
          starColor: 'text-purple-200/80',
          dotColor: 'bg-indigo-100/70'
        };
    }
  }, [activeWeather]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-in-out">
      {/* Background Deep Atmospheric Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${weatherConfig.bgGradient} transition-all duration-1000`}
      />

      {/* Floating Aurora Light Orbs (Mesh Gradient Simulation) */}
      <div className="absolute inset-0 overflow-hidden">
        {weatherConfig.orbs.map((orb, idx) => (
          <div
            key={idx}
            className={`absolute ${orb.size} ${orb.pos} ${orb.bg} rounded-full blur-[100px] pointer-events-none transition-all duration-1000 animate-pulse`}
            style={{
              animationDuration: `${7 + idx * 2}s`,
              animationDelay: orb.delay
            }}
          />
        ))}
      </div>

      {/* Atmospheric Particles: Ethereal Falling Rain or Floating Breeze Stardust */}
      {activeWeather === 'rain' ? (
        /* Gentle soft falling ethereal drizzle */
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: '4%', delay: '0.1s', dur: '1.9s' },
            { left: '11%', delay: '0.8s', dur: '2.4s' },
            { left: '18%', delay: '1.3s', dur: '1.8s' },
            { left: '25%', delay: '0.4s', dur: '2.2s' },
            { left: '32%', delay: '1.7s', dur: '2.0s' },
            { left: '39%', delay: '0.2s', dur: '2.5s' },
            { left: '46%', delay: '1.1s', dur: '1.9s' },
            { left: '53%', delay: '0.6s', dur: '2.3s' },
            { left: '60%', delay: '1.5s', dur: '2.1s' },
            { left: '67%', delay: '0.3s', dur: '1.8s' },
            { left: '74%', delay: '1.0s', dur: '2.4s' },
            { left: '81%', delay: '0.5s', dur: '2.0s' },
            { left: '88%', delay: '1.4s', dur: '2.2s' },
            { left: '94%', delay: '0.7s', dur: '1.9s' },
            { left: '98%', delay: '1.2s', dur: '2.3s' }
          ].map((drop, idx) => (
            <div
              key={`rain-${idx}`}
              className="rain-streak"
              style={{
                left: drop.left,
                top: '-40px',
                animationDelay: drop.delay,
                animationDuration: drop.dur
              }}
            />
          ))}
        </div>
      ) : (
        /* Dreamy Drifting Stars & 4-Point Sparkles (✦) */
        <div className="absolute inset-0">
          {/* Delicate 4-point Sparkles drifting with ethereal breeze */}
          {[
            { top: '10%', left: '18%', size: 'text-xs', delay: '0.2s', dur: '5.5s' },
            { top: '18%', left: '76%', size: 'text-sm', delay: '1.2s', dur: '6s' },
            { top: '32%', left: '46%', size: 'text-xs', delay: '2.1s', dur: '5s' },
            { top: '45%', left: '86%', size: 'text-xs', delay: '0.8s', dur: '6.5s' },
            { top: '62%', left: '14%', size: 'text-sm', delay: '1.7s', dur: '5.8s' },
            { top: '75%', left: '63%', size: 'text-xs', delay: '2.5s', dur: '6.2s' },
            { top: '85%', left: '28%', size: 'text-xs', delay: '0.5s', dur: '5.2s' }
          ].map((sparkle, idx) => (
            <div
              key={`sparkle-${idx}`}
              className={`breeze-mote select-none font-bold ${sparkle.size} ${weatherConfig.starColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`}
              style={{
                top: sparkle.top,
                left: sparkle.left,
                animationDelay: sparkle.delay,
                animationDuration: sparkle.dur
              }}
            >
              ✦
            </div>
          ))}

          {/* Soft Twinkling Light Dots */}
          {[
            { top: '14%', left: '35%', size: 'w-1 h-1' },
            { top: '24%', left: '62%', size: 'w-1.5 h-1.5' },
            { top: '38%', left: '12%', size: 'w-1 h-1' },
            { top: '52%', left: '72%', size: 'w-1 h-1' },
            { top: '68%', left: '84%', size: 'w-1.5 h-1.5' },
            { top: '80%', left: '45%', size: 'w-1 h-1' }
          ].map((dot, idx) => (
            <div
              key={`dot-${idx}`}
              className={`absolute ${dot.size} rounded-full ${weatherConfig.dotColor} blur-[0.5px] animate-pulse`}
              style={{
                top: dot.top,
                left: dot.left,
                animationDelay: `${idx * 0.6}s`,
                animationDuration: `${2.5 + (idx % 3)}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Compact & Responsive Weather Selector for Header
export const WeatherPill: React.FC<{
  currentWeather: WeatherMode;
  onSelectWeather: (m: WeatherMode) => void;
}> = ({ currentWeather, onSelectWeather }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuto, setIsAuto] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_AUTO) !== 'false';
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const options: { mode: WeatherMode; label: string; icon: any }[] = [
    { mode: 'morning', label: 'Mañana', icon: Sun },
    { mode: 'afternoon', label: 'Tarde', icon: Sunset },
    { mode: 'night', label: 'Noche', icon: Moon },
    { mode: 'rain', label: 'Lluvia', icon: CloudRain }
  ];

  const currentOption = options.find((o) => o.mode === currentWeather) || options[0];
  const CurrentIcon = currentOption.icon;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSelect = (mode: WeatherMode) => {
    setIsAuto(false);
    localStorage.setItem(STORAGE_KEY_AUTO, 'false');
    localStorage.setItem(STORAGE_KEY_WEATHER, mode);
    onSelectWeather(mode);
    setIsOpen(false);
  };

  const handleEnableAuto = () => {
    setIsAuto(true);
    localStorage.setItem(STORAGE_KEY_AUTO, 'true');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const liveWeather = await fetchLiveWeatherFromCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          onSelectWeather(liveWeather);
        },
        () => {
          onSelectWeather(getAutoWeatherByTime());
        }
      );
    } else {
      onSelectWeather(getAutoWeatherByTime());
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Sleek Compact Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-inner)] hover:bg-white/10 border border-[var(--surface-border)] text-xs text-slate-200 shadow-sm transition-all flex-shrink-0"
        title="Cambiar atmósfera y clima dinámico"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-[var(--accent-primary)] flex-shrink-0" />
        <span className="text-[11px] font-bold hidden sm:inline">{currentOption.label}</span>
        {isAuto && (
          <span className="text-[9px] bg-white/10 text-slate-300 px-1 rounded font-black hidden sm:inline">
            Auto
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Atmosphere Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 cozy-card border border-[var(--surface-border)] rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2 py-1 mb-1 border-b border-[var(--surface-border)] flex items-center justify-between">
            <span>Atmósfera & Clima</span>
          </div>

          {/* Auto Mode Toggle */}
          <button
            onClick={handleEnableAuto}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all mb-1 ${
              isAuto ? 'bg-white text-indigo-950 font-black shadow-md' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Auto (Hora y Clima)</span>
            </span>
            {isAuto && <Check className="w-3.5 h-3.5" />}
          </button>

          <div className="h-px bg-white/10 my-1" />

          {/* Manual Options */}
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = !isAuto && currentWeather === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => handleManualSelect(opt.mode)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected ? 'bg-white text-indigo-950 font-black shadow-md' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
