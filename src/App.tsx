import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Pokemon, SnorlaxConfig, OptimizedTeamResult, MidWeekProgress } from './types/pokemon';
import { optimizeTeam } from './services/optimizer';
import { Navbar, ActiveTab } from './components/Navbar';
import { SnorlaxSetup } from './components/SnorlaxSetup';
import { TeamOptimizerView } from './components/TeamOptimizerView';
import { TeamSimulatorView } from './components/TeamSimulatorView';
import { PokedexView } from './components/PokedexView';
import { RecipesView } from './components/RecipesView';
import { ExcelManager } from './components/ExcelManager';
import { PokemonModal } from './components/PokemonModal';
import { WeatherBackground, WeatherMode, getAutoWeather } from './components/WeatherBackground';
import {
  ProfileId,
  SyncStatus,
  loadProfileData,
  saveProfileData,
  getProfileFromLocal,
  saveProfileToLocal,
  queueProfileSave,
  cancelPendingSave,
  isSupabaseConfigured,
  STORAGE_KEY_ACTIVE_PROFILE
} from './services/supabase';

const STORAGE_KEY_WEATHER = 'sleep_master_weather_v1';

export const App: React.FC = () => {
  // Active Profile ('cris' | 'ady')
  const [activeProfile, setActiveProfile] = useState<ProfileId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);
      if (saved === 'cris' || saved === 'ady') {
        return saved as ProfileId;
      }
    } catch (e) {
      // ignore
    }
    return 'cris';
  });

  // Cloud Sync Status ('local' | 'syncing' | 'synced' | 'error')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    return isSupabaseConfigured ? 'synced' : 'local';
  });

  // Load initial Pokemons from profile-specific LocalStorage (with legacy migration for Cris)
  const [pokemons, setPokemons] = useState<Pokemon[]>(() => {
    return getProfileFromLocal(activeProfile).pokemons;
  });

  // Load initial Snorlax Config from profile-specific LocalStorage
  const [config, setConfig] = useState<SnorlaxConfig>(() => {
    return getProfileFromLocal(activeProfile).config;
  });

  // Weather state (Morning, Afternoon, Night, Rain)
  const [weather, setWeather] = useState<WeatherMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEATHER);
      if (saved && ['morning', 'afternoon', 'night', 'rain'].includes(saved)) {
        return saved as WeatherMode;
      }
    } catch (e) {
      // ignore
    }
    return getAutoWeather();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('optimizer');
  const [optimizedResults, setOptimizedResults] = useState<OptimizedTeamResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [spriteStyle, setSpriteStyle] = useState<'artwork' | 'showdown'>('artwork');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pokemonToEdit, setPokemonToEdit] = useState<Pokemon | null>(null);

  // Background cloud fetch on initial mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      setSyncStatus('syncing');
      loadProfileData(activeProfile)
        .then((profileData) => {
          if (profileData && Array.isArray(profileData.pokemons)) {
            setPokemons(profileData.pokemons);
            setConfig(profileData.config);
            setSyncStatus(profileData.isCloud ? 'synced' : 'local');
          }
        })
        .catch((err) => {
          console.warn('Initial cloud sync error:', err);
          setSyncStatus('error');
        });
    }
  }, []);

  // Auto-sync whenever pokemons or config change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    queueProfileSave(activeProfile, pokemons, config, setSyncStatus);
  }, [pokemons, config, activeProfile]);

  // Profile switch handler
  const handleSelectProfile = useCallback(async (newProfile: ProfileId) => {
    if (newProfile === activeProfile) return;

    // 1. Cancel pending cloud sync timer & persist current profile to local
    cancelPendingSave();
    saveProfileToLocal(activeProfile, pokemons, config);

    // 2. Load target profile immediately from LocalStorage (0ms UI lag)
    const targetLocal = getProfileFromLocal(newProfile);

    // 3. Update active profile state & localStorage key
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, newProfile);
    } catch (e) {
      // ignore
    }
    setActiveProfile(newProfile);
    setPokemons(targetLocal.pokemons);
    setConfig(targetLocal.config);

    // 4. Asynchronously fetch latest data from Supabase Cloud if configured
    if (isSupabaseConfigured) {
      setSyncStatus('syncing');
      try {
        const cloudData = await loadProfileData(newProfile);
        if (cloudData && Array.isArray(cloudData.pokemons)) {
          setPokemons(cloudData.pokemons);
          setConfig(cloudData.config);
          setSyncStatus(cloudData.isCloud ? 'synced' : 'local');
        }
      } catch (err) {
        console.warn('Error fetching cloud profile on switch:', err);
        setSyncStatus('error');
      }
    } else {
      setSyncStatus('local');
    }
  }, [activeProfile, pokemons, config]);

  // Run optimizer
  const handleRunOptimizer = useCallback(() => {
    setIsCalculating(true);
    // Slight timeout so UI shows spinner immediately
    setTimeout(() => {
      try {
        const topTeams = optimizeTeam(pokemons, config, 3);
        setOptimizedResults(topTeams);
      } catch (err) {
        console.error('Error running optimizer', err);
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  }, [pokemons, config]);

  // Run on mount or when pokemons or config change
  useEffect(() => {
    handleRunOptimizer();
  }, [handleRunOptimizer]);

  // Handle save Pokemon (add or edit)
  const handleSavePokemon = (pokemonData: Pokemon) => {
    setPokemons(prev => {
      const existingIndex = prev.findIndex(p => p.id === pokemonData.id);
      let updated: Pokemon[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = pokemonData;
      } else {
        updated = [pokemonData, ...prev];
      }
      // Save immediately to local storage and sync to cloud without delay
      saveProfileData(activeProfile, updated, config).then(res => {
        if (res.cloudSynced) setSyncStatus('synced');
      });
      return updated;
    });
  };

  const handleEditPokemon = (pokemon: Pokemon) => {
    setPokemonToEdit(pokemon);
    setIsModalOpen(true);
  };

  const handleAddNewPokemon = () => {
    setPokemonToEdit(null);
    setIsModalOpen(true);
  };

  // Update recipe level handler
  const handleUpdateRecipeLevel = useCallback((recipeName: string, level: number) => {
    setConfig(prev => ({
      ...prev,
      recipeLevels: {
        ...(prev.recipeLevels || {}),
        [recipeName]: level
      }
    }));
  }, []);

  // Update batch recipe levels handler
  const handleUpdateAllRecipeLevels = useCallback((newLevels: Record<string, number>) => {
    setConfig(prev => ({
      ...prev,
      recipeLevels: {
        ...(prev.recipeLevels || {}),
        ...newLevels
      }
    }));
  }, []);

  // Update area bonus handler
  const handleUpdateAreaBonus = useCallback((bonus: number) => {
    setConfig(prev => ({
      ...prev,
      areaBonus: bonus
    }));
  }, []);

  // Toggle Good Camp Ticket handler
  const handleToggleGoodCampTicket = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      goodCampTicket: !prev.goodCampTicket
    }));
  }, []);

  // Set active in-game team handler
  const handleSetCurrentTeam = useCallback((pokemonIds: string[], teamName?: string) => {
    setConfig(prev => ({
      ...prev,
      currentTeam: {
        pokemonIds,
        teamName: teamName || 'Mi Equipo Actual',
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  // Mid-week progress calibration handler
  const handleUpdateMidWeekProgress = useCallback((progress: MidWeekProgress) => {
    setConfig(prev => ({
      ...prev,
      midWeekProgress: {
        ...progress,
        updatedAt: progress.updatedAt || new Date().toISOString(),
        isCalibrated: progress.isCalibrated ?? true
      }
    }));
  }, []);

  // Reset mid-week calibration to theoretical
  const handleResetMidWeekProgress = useCallback(() => {
    setConfig(prev => {
      const copy = { ...prev };
      delete copy.midWeekProgress;
      return copy;
    });
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col pb-24 md:pb-10 relative">
      {/* Dynamic Ambient Sky / Weather Background */}
      <WeatherBackground currentWeather={weather} onWeatherChange={setWeather} />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add') {
            handleAddNewPokemon();
          } else {
            setActiveTab(tab);
          }
        }}
        pokemonCount={pokemons.length}
        currentWeather={weather}
        onWeatherChange={setWeather}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        syncStatus={syncStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: OPTIMIZADOR */}
        {activeTab === 'optimizer' && (
          <div className="space-y-6">
            <SnorlaxSetup
              config={config}
              onChangeConfig={setConfig}
              onRunOptimizer={handleRunOptimizer}
              isCalculating={isCalculating}
            />

            <TeamOptimizerView
              results={optimizedResults}
              config={config}
              allPokemons={pokemons}
              onSetCurrentTeam={handleSetCurrentTeam}
              onUpdateMidWeekProgress={handleUpdateMidWeekProgress}
              onResetMidWeekProgress={handleResetMidWeekProgress}
              onEditPokemon={handleEditPokemon}
              onOpenSimulator={() => setActiveTab('simulator')}
              spriteStyle={spriteStyle}
            />
          </div>
        )}

        {/* TAB 2: SIMULADOR DE EQUIPOS */}
        {activeTab === 'simulator' && (
          <TeamSimulatorView
            pokemons={pokemons}
            config={config}
            recommendedResult={optimizedResults[0]}
            spriteStyle={spriteStyle}
            onEditPokemon={handleEditPokemon}
            onUpdateRecipeLevel={handleUpdateRecipeLevel}
            onUpdateAreaBonus={handleUpdateAreaBonus}
            onToggleGoodCampTicket={handleToggleGoodCampTicket}
            onSetCurrentTeam={handleSetCurrentTeam}
            onUpdateMidWeekProgress={handleUpdateMidWeekProgress}
            onResetMidWeekProgress={handleResetMidWeekProgress}
          />
        )}

        {/* TAB 3: MI POKEDEX */}
        {activeTab === 'pokedex' && (
          <PokedexView
            pokemons={pokemons}
            favoriteBerries={config.favoriteBerries}
            onEditPokemon={handleEditPokemon}
            onAddNew={handleAddNewPokemon}
            spriteStyle={spriteStyle}
            activeProfile={activeProfile}
            onGoToDatabase={() => setActiveTab('excel')}
          />
        )}

        {/* TAB 3: RECETARIO */}
        {activeTab === 'recipes' && (
          <RecipesView
            config={config}
            onUpdateRecipeLevel={handleUpdateRecipeLevel}
            onUpdateAllRecipeLevels={handleUpdateAllRecipeLevels}
          />
        )}

        {/* TAB 4: BASE DE DATOS EXCEL */}
        {activeTab === 'excel' && (
          <ExcelManager
            pokemons={pokemons}
            onUpdatePokemons={(newPokemons) => {
              setPokemons(newPokemons);
              handleRunOptimizer();
            }}
          />
        )}
      </main>

      {/* Add / Edit Pokemon Modal */}
      <PokemonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePokemon}
        onDelete={(id) => {
          setPokemons(prev => {
            const updated = prev.filter(p => p.id !== id);
            saveProfileData(activeProfile, updated, config).then(res => {
              if (res.cloudSynced) setSyncStatus('synced');
            });
            return updated;
          });
          setIsModalOpen(false);
          setPokemonToEdit(null);
        }}
        pokemonToEdit={pokemonToEdit}
      />
    </div>
  );
};
