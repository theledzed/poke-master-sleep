import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pokemon, SnorlaxConfig, OptimizedTeamResult } from './types/pokemon';
import { DEFAULT_CSV_DATA } from './data/defaultPokedex';
import { parseCsvText } from './services/csvParser';
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

const STORAGE_KEY_POKEDEX = 'sleep_master_pokedex_v1';
const STORAGE_KEY_CONFIG = 'sleep_master_config_v1';
const STORAGE_KEY_WEATHER = 'sleep_master_weather_v1';

export const App: React.FC = () => {
  // Load initial Pokemons from localStorage or default CSV
  const [pokemons, setPokemons] = useState<Pokemon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POKEDEX);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved pokedex', e);
    }
    return parseCsvText(DEFAULT_CSV_DATA);
  });

  // Load initial Snorlax Config
  const [config, setConfig] = useState<SnorlaxConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.areaBonus === undefined) parsed.areaBonus = 0;
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved config', e);
    }
    return {
      island: 'greengrass',
      dishType: 'curry',
      favoriteBerries: ['Baya Uvav', 'Baya Zanama', 'Baya Aranja'],
      potSize: 45,
      isSunday: false,
      recipeLevels: {},
      areaBonus: 0
    };
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

  // Save to localStorage when pokedex changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POKEDEX, JSON.stringify(pokemons));
    } catch (e) {
      console.error('Error saving pokedex', e);
    }
  }, [pokemons]);

  // Save to localStorage when config changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config', e);
    }
  }, [config]);

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
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = pokemonData;
        return updated;
      } else {
        return [pokemonData, ...prev];
      }
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
          />
        )}

        {/* TAB 3: RECETARIO */}
        {activeTab === 'recipes' && (
          <RecipesView
            config={config}
            onUpdateRecipeLevel={handleUpdateRecipeLevel}
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
        pokemonToEdit={pokemonToEdit}
      />
    </div>
  );
};
