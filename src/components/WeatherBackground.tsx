import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sun, Sunset, Moon, CloudRain, Sparkles, Compass, Check, ChevronDown } from 'lucide-react';

export type WeatherMode = 'morning' | 'afternoon' | 'night' | 'rain';

interface WeatherBackgroundProps {
  currentWeather?: WeatherMode;
  onWeatherChange?: (mode: WeatherMode) => void;
}

const STORAGE_KEY_WEATHER = 'sleep_master_weather_v1';
const STORAGE_KEY_AUTO = 'sleep_master_weather_auto_v1';

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

  // Weather atmosphere styles
  const weatherConfig = useMemo(() => {
    switch (activeWeather) {
      case 'morning':
        return {
          label: 'Mañana Fresca',
          icon: Sun,
          iconColor: 'text-amber-400',
          bgGradient: 'from-[#0A2640] via-[#0E3C5D] to-[#081829]',
          ambientRays:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(56, 189, 248, 0.35), transparent 70%), radial-gradient(circle 600px at 85% 15%, rgba(251, 191, 36, 0.22), transparent), radial-gradient(circle 500px at 15% 40%, rgba(16, 185, 129, 0.12), transparent)',
          particleColor: 'bg-amber-200/60'
        };
      case 'afternoon':
        return {
          label: 'Atardecer Dorado',
          icon: Sunset,
          iconColor: 'text-amber-300',
          bgGradient: 'from-[#23141F] via-[#2F1B2A] to-[#130B14]',
          ambientRays:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(245, 158, 11, 0.32), transparent 70%), radial-gradient(circle 600px at 85% 20%, rgba(239, 68, 68, 0.20), transparent), radial-gradient(circle 450px at 15% 50%, rgba(251, 191, 36, 0.15), transparent)',
          particleColor: 'bg-orange-300/50'
        };
      case 'rain':
        return {
          label: 'Lluvia Serena',
          icon: CloudRain,
          iconColor: 'text-sky-300',
          bgGradient: 'from-[#071929] via-[#0D2B42] to-[#06121C]',
          ambientRays:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(56, 189, 248, 0.28), transparent 70%), radial-gradient(circle 600px at 20% 30%, rgba(16, 185, 129, 0.14), transparent)',
          particleColor: 'bg-sky-200/70'
        };
      case 'night':
      default:
        return {
          label: 'Noche Estrellada',
          icon: Moon,
          iconColor: 'text-cyan-300',
          bgGradient: 'from-[#050C1D] via-[#0A1738] to-[#040815]',
          ambientRays:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(99, 102, 241, 0.30), transparent 70%), radial-gradient(circle 600px at 85% 15%, rgba(45, 212, 191, 0.18), transparent)',
          particleColor: 'bg-indigo-100/70'
        };
    }
  }, [activeWeather]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-in-out">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${weatherConfig.bgGradient} transition-all duration-1000`}
        style={{ backgroundImage: weatherConfig.ambientRays }}
      />

      {/* Atmospheric Particles */}
      {activeWeather === 'rain' ? (
        /* Raindrops */
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="rain-pattern" width="60" height="80" patternUnits="userSpaceOnUse">
                <line x1="10" y1="0" x2="5" y2="25" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.5" />
                <line x1="40" y1="30" x2="35" y2="55" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="25" y1="60" x2="20" y2="80" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rain-pattern)" className="animate-pulse" />
          </svg>
        </div>
      ) : (
        /* Stars / Floating Sunbeams */
        <div className="absolute inset-0">
          {[
            { top: '12%', left: '18%', size: 'w-1 h-1', dur: 'duration-700' },
            { top: '22%', left: '75%', size: 'w-1.5 h-1.5', dur: 'duration-1000' },
            { top: '35%', left: '42%', size: 'w-1 h-1', dur: 'duration-500' },
            { top: '48%', left: '88%', size: 'w-1 h-1', dur: 'duration-800' },
            { top: '65%', left: '25%', size: 'w-1.5 h-1.5', dur: 'duration-1200' },
            { top: '78%', left: '60%', size: 'w-1 h-1', dur: 'duration-600' },
            { top: '18%', left: '55%', size: 'w-2 h-2', dur: 'duration-1000' }
          ].map((s, idx) => (
            <div
              key={idx}
              className={`absolute ${s.size} rounded-full ${weatherConfig.particleColor} blur-[0.5px] animate-pulse`}
              style={{
                top: s.top,
                left: s.left,
                animationDelay: `${idx * 0.4}s`,
                animationDuration: `${2 + (idx % 3)}s`
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
      {/* Sleek Compact Trigger Pill (fits perfectly on mobile without bumping title) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a203a] hover:bg-[#0f2d50] border border-sky-400/25 text-xs text-sky-200 shadow-sm transition-all flex-shrink-0"
        title="Cambiar atmósfera y clima dinámico"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <span className="text-[11px] font-bold hidden sm:inline">{currentOption.label}</span>
        {isAuto && (
          <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 rounded font-black hidden sm:inline">
            Auto
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Atmosphere Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c2444] border border-sky-400/30 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2 py-1 mb-1 border-b border-sky-400/15 flex items-center justify-between">
            <span>Atmósfera & Clima</span>
          </div>

          {/* Auto Mode Toggle */}
          <button
            onClick={handleEnableAuto}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all mb-1 ${
              isAuto ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Auto (Hora y Clima)</span>
            </span>
            {isAuto && <Check className="w-3.5 h-3.5 text-sky-400" />}
          </button>

          <div className="h-px bg-sky-400/15 my-1" />

          {/* Manual Options */}
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = !isAuto && currentWeather === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => handleManualSelect(opt.mode)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-sky-300" />
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
