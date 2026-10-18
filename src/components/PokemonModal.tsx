import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, Specialty, IngredientSlot, Subskill } from '../types/pokemon';
import { BERRIES, INGREDIENTS, NATURES, KNOWN_SUBSKILLS, parseNature, CANONICAL_BERRIES } from '../data/gameData';
import { parseFrequency } from '../services/csvParser';
import {
  getPokemonArtworkUrl,
  getBerrySpriteUrl,
  getIngredientSpriteUrl,
  getPokemonCanonicalSkill,
  MAIN_SKILLS_META
} from '../services/pokeApiService';
import { getPokemonSkillLevel } from '../services/optimizer';
import {
  POKEMON_SPECIES_CATALOG,
  searchSpeciesCatalog,
  findSpeciesCatalogEntry,
  SpeciesCatalogEntry
} from '../data/pokemonCatalog';
import { X, Check, Plus, Trash2, Lock, CheckCircle2, Sparkles, Star, ChevronDown, Search } from 'lucide-react';

interface PokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pokemon: Pokemon) => void;
  onDelete?: (pokemonId: string) => void;
  pokemonToEdit?: Pokemon | null;
}

export const PokemonModal: React.FC<PokemonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  pokemonToEdit
}) => {
  const isEditing = Boolean(pokemonToEdit);

  const [name, setName] = useState('');
  const [isShiny, setIsShiny] = useState(false);
  const [level, setLevel] = useState<number | string>(25);
  const [rp, setRp] = useState<number | string>(1000);
  const [frequencyStr, setFrequencyStr] = useState('45 min 0s');
  const [specialty, setSpecialty] = useState<Specialty>('Bayas');
  const [berry, setBerry] = useState<string>('Baya Caquic');
  const [natureName, setNatureName] = useState<string>('Dócil');
  const [mainSkillName, setMainSkillName] = useState<string>('Carga vigor S');
  const [mainSkillLevel, setMainSkillLevel] = useState<number>(1);
  const [notes, setNotes] = useState('');

  // 3 Ingredient slots
  const [ing1Name, setIng1Name] = useState<string>('Manzana Selecta');
  const [ing1Count, setIng1Count] = useState<number | string>(1);

  const [ing2Name, setIng2Name] = useState<string>('Manzana Selecta');
  const [ing2Count, setIng2Count] = useState<number | string>(2);

  const [ing3Name, setIng3Name] = useState<string>('Manzana Selecta');
  const [ing3Count, setIng3Count] = useState<number | string>(3);

  // Subskills list
  const [subskills, setSubskills] = useState<string[]>([
    'Velocidad ayuda S',
    'Activación S',
    'Busca bayas S',
    '',
    ''
  ]);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SpeciesCatalogEntry[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pokemonToEdit) {
      setName(pokemonToEdit.name);
      setIsShiny(Boolean(pokemonToEdit.notes?.toLowerCase().includes('shiny') || pokemonToEdit.notes?.toLowerCase().includes('variocolor')));
      setLevel(pokemonToEdit.level);
      setRp(pokemonToEdit.rp);
      setFrequencyStr(pokemonToEdit.frequencyStr);
      setSpecialty(pokemonToEdit.specialty);
      setBerry(pokemonToEdit.berry);
      setNatureName(pokemonToEdit.natureObj?.name || 'Dócil');
      setMainSkillName(pokemonToEdit.mainSkillName || getPokemonCanonicalSkill(pokemonToEdit.name));
      setMainSkillLevel(pokemonToEdit.mainSkillLevel || getPokemonSkillLevel(pokemonToEdit) || 1);
      setNotes(pokemonToEdit.notes || '');

      const s1 = pokemonToEdit.ingredients[0];
      if (s1) {
        setIng1Name(s1.name);
        setIng1Count(s1.count);
      }
      const s2 = pokemonToEdit.ingredients[1];
      if (s2) {
        setIng2Name(s2.name);
        setIng2Count(s2.count);
      }
      const s3 = pokemonToEdit.ingredients[2];
      if (s3) {
        setIng3Name(s3.name);
        setIng3Count(s3.count);
      }

      const existingSubs = pokemonToEdit.subskills.map(s => s.name);
      setSubskills([
        existingSubs[0] || '',
        existingSubs[1] || '',
        existingSubs[2] || '',
        existingSubs[3] || '',
        existingSubs[4] || ''
      ]);
    } else {
      // Defaults for new Pokemon
      setName('');
      setIsShiny(false);
      setLevel(15);
      setRp(750);
      setFrequencyStr('45 min 0s');
      setSpecialty('Bayas');
      setBerry('Baya Caquic');
      setNatureName('Dócil');
      setMainSkillName('Carga vigor S');
      setMainSkillLevel(1);
      setNotes('');
      setIng1Name('Manzana Selecta');
      setIng1Count(1);
      setIng2Name('Manzana Selecta');
      setIng2Count(2);
      setIng3Name('Manzana Selecta');
      setIng3Count(3);
      setSubskills(['', '', '', '', '']);
    }
    setShowSuggestions(false);
  }, [pokemonToEdit, isOpen]);

  const handleSelectSpecies = (entry: SpeciesCatalogEntry) => {
    setName(entry.name);
    setSpecialty(entry.specialty);
    setBerry(entry.berry);
    setMainSkillName(entry.mainSkill);
    if (entry.ingredients) {
      if (entry.ingredients[0]) setIng1Name(entry.ingredients[0]);
      if (entry.ingredients[1]) setIng2Name(entry.ingredients[1]);
      if (entry.ingredients[2]) setIng3Name(entry.ingredients[2]);
    }
    if (!pokemonToEdit && entry.frequencyStr) {
      setFrequencyStr(entry.frequencyStr);
    }
    setShowSuggestions(false);
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!pokemonToEdit) {
      const match = findSpeciesCatalogEntry(newName);
      if (match && match.name.toLowerCase() === newName.toLowerCase().trim()) {
        setSpecialty(match.specialty);
        setBerry(match.berry);
        setMainSkillName(match.mainSkill);
        if (match.ingredients) {
          setIng1Name(match.ingredients[0]);
          setIng2Name(match.ingredients[1]);
          setIng3Name(match.ingredients[2]);
        }
        if (match.frequencyStr) {
          setFrequencyStr(match.frequencyStr);
        }
      }
    }
    setSuggestions(searchSpeciesCatalog(newName, 8));
    setShowSuggestions(true);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const natureObj = parseNature(natureName);
    const frequencySeconds = parseFrequency(frequencyStr);

    const finalLevel = typeof level === 'number' ? level : parseInt(String(level), 10) || 1;
    const finalRp = typeof rp === 'number' ? rp : parseInt(String(rp), 10) || 0;
    const finalIng1Count = typeof ing1Count === 'number' ? ing1Count : parseInt(String(ing1Count), 10) || 1;
    const finalIng2Count = typeof ing2Count === 'number' ? ing2Count : parseInt(String(ing2Count), 10) || 2;
    const finalIng3Count = typeof ing3Count === 'number' ? ing3Count : parseInt(String(ing3Count), 10) || 3;

    const ingredients: IngredientSlot[] = [
      {
        name: ing1Name,
        count: finalIng1Count,
        unlockLevel: 1,
        enabled: finalLevel >= 1
      },
      {
        name: ing2Name,
        count: finalIng2Count,
        unlockLevel: 30,
        enabled: finalLevel >= 30
      },
      {
        name: ing3Name,
        count: finalIng3Count,
        unlockLevel: 60,
        enabled: finalLevel >= 60
      }
    ];

    const unlockLevels: (10 | 25 | 50 | 75 | 100)[] = [10, 25, 50, 75, 100];
    const parsedSubskills: Subskill[] = subskills
      .filter(s => s.trim().length > 0)
      .map((subName, idx) => {
        const meta = KNOWN_SUBSKILLS[subName] || { tier: 'white' as const, description: 'Habilidad secundaria' };
        const unlock = unlockLevels[idx] || 100;
        return {
          name: subName,
          tier: meta.tier,
          description: meta.description,
          unlockLevel: unlock,
          enabled: finalLevel >= unlock
        };
      });

    let finalNotes = notes.trim();
    if (isShiny && !finalNotes.toLowerCase().includes('shiny') && !finalNotes.toLowerCase().includes('variocolor')) {
      finalNotes = finalNotes ? `${finalNotes} (Shiny)` : 'Shiny';
    } else if (!isShiny && (finalNotes.toLowerCase().includes('shiny') || finalNotes.toLowerCase().includes('variocolor'))) {
      finalNotes = finalNotes.replace(/\(Shiny\)/gi, '').replace(/shiny/gi, '').replace(/variocolor/gi, '').trim();
    }

    const newPokemon: Pokemon = {
      id: pokemonToEdit ? pokemonToEdit.id : `poke-new-${Date.now()}`,
      name: name.trim(),
      frequencyStr,
      frequencySeconds,
      level: finalLevel,
      rp: finalRp,
      specialty,
      nature: natureName,
      natureObj,
      berry,
      berryType: BERRIES[berry]?.type || 'Normal',
      ingredients,
      subskills: parsedSubskills,
      notes: finalNotes,
      mainSkillName: mainSkillName || getPokemonCanonicalSkill(name),
      mainSkillLevel: mainSkillLevel || 1
    };

    onSave(newPokemon);
    onClose();
  };

  const allBerries = Object.keys(BERRIES);
  const allIngredients = Object.keys(INGREDIENTS);
  const allSubskillNames = Object.keys(KNOWN_SUBSKILLS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="poke-card pokeball-watermark rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#080C16]/70 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isEditing ? '✏️' : '✨'}</span>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isEditing ? `Editar a ${pokemonToEdit?.name}` : 'Dar de Alta Nuevo Pokémon'}
              </h3>
              <p className="text-xs text-slate-300">
                Formato idéntico a tu base de datos maestra de Pokémon Sleep
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Live Pokemon Preview & Shiny Switch */}
          <div className="flex items-center gap-3.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 relative flex-shrink-0">
              <img
                src={getPokemonArtworkUrl(name || 'Pikachu', 'artwork', isShiny)}
                alt={name || 'Pokemon'}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                onError={(e) => { (e.target as HTMLElement).style.opacity = '0.4'; }}
              />
              {isShiny && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full shadow animate-pulse">
                  <Sparkles className="w-3 h-3 fill-current" />
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{name || 'Escribe el nombre del Pokémon'}</span>
                  {isShiny && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.2 rounded-full">
                      Variocolor
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ilustración y sprites oficiales sincronizados con PokeAPI
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsShiny(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
                  isShiny
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 ring-2 ring-amber-400/50'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isShiny ? '✨ Variocolor / Shiny' : 'Forma Normal'}</span>
              </button>
            </div>
          </div>

          {/* Fila 1: Nombre con Autocompletado, Nivel, PA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Especie / Nombre</span>
                <span className="text-[10px] text-sky-400 font-normal">Autocompleta datos</span>
              </label>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  placeholder="ej. Raichu, Mew, Gengar..."
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => {
                    setSuggestions(searchSpeciesCatalog(name, 8));
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSuggestions(searchSpeciesCatalog(name, 8));
                    setShowSuggestions(prev => !prev);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
                  title="Ver catálogo de especies oficiales"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-[#08182c] border border-sky-400/30 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-sky-950/60 backdrop-blur-xl"
                >
                  <div className="p-2 bg-sky-950/40 text-[10px] text-sky-300 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Especies de Pokémon Sleep</span>
                    <span className="text-slate-400 font-normal text-[9px]">Click para autocompletar</span>
                  </div>
                  {suggestions.map((entry) => {
                    const artworkUrl = getPokemonArtworkUrl(entry.name, 'artwork', false);
                    return (
                      <button
                        key={entry.name}
                        type="button"
                        onClick={() => handleSelectSpecies(entry)}
                        className="w-full text-left px-3 py-2 hover:bg-sky-900/40 flex items-center justify-between gap-2 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-0.5 flex-shrink-0 group-hover:border-sky-400/40">
                            <img
                              src={artworkUrl}
                              alt={entry.name}
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                            />
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-xs text-white group-hover:text-sky-300 truncate">
                              {entry.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                              <span className="text-amber-400">{entry.berry}</span>
                              <span>•</span>
                              <span className="truncate text-slate-300">{entry.mainSkill}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border flex-shrink-0 ${
                          entry.specialty === 'Bayas'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : entry.specialty === 'Ingredientes'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : entry.specialty === 'Todo'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}>
                          {entry.specialty}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nivel {level !== '' ? `(${level})` : ''}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={level}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setLevel('');
                  } else {
                    const parsed = parseInt(val, 10);
                    setLevel(isNaN(parsed) ? '' : Math.max(1, Math.min(100, parsed)));
                  }
                }}
                onBlur={() => {
                  if (level === '' || Number(level) < 1) setLevel(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Poder de Ayuda (PA)</label>
              <input
                type="number"
                min="0"
                value={rp}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setRp('');
                  } else {
                    const parsed = parseInt(val, 10);
                    setRp(isNaN(parsed) ? '' : Math.max(0, parsed));
                  }
                }}
                onBlur={() => {
                  if (rp === '' || Number(rp) < 0) setRp(0);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Fila 2: Especialidad, Baya, Frecuencia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Especialidad</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as Specialty)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Bayas">Bayas (+1 Baya base)</option>
                <option value="Ingredientes">Ingredientes (Mayor cuota)</option>
                <option value="Habilidades">Habilidades (2 activaciones)</option>
                <option value="Todo">Todo (Bayas + Ingr + Habilidades)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Baya</label>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src={getBerrySpriteUrl(berry)}
                    alt={berry}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <select
                  value={berry}
                  onChange={(e) => setBerry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {CANONICAL_BERRIES.map(b => (
                    <option key={b} value={b}>
                      {BERRIES[b]?.icon || '🍒'} {b} ({BERRIES[b]?.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Frecuencia</label>
              <input
                type="text"
                placeholder="ej. 35 min 12s o 1h 5min"
                value={frequencyStr}
                onChange={(e) => setFrequencyStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Fila 3: Naturaleza, Habilidad Principal y Nivel de Habilidad */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Naturaleza</label>
              <select
                value={natureName}
                onChange={(e) => setNatureName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                {Object.keys(NATURES).map(natKey => {
                  const nat = NATURES[natKey];
                  const label = nat.upStat
                    ? `${nat.name} (+${nat.upStat}, -${nat.downStat})`
                    : `${nat.name} (Neutra / Sin efecto)`;
                  return (
                    <option key={natKey} value={natKey}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Habilidad Principal</label>
              <select
                value={mainSkillName}
                onChange={(e) => setMainSkillName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium truncate"
              >
                {Object.keys(MAIN_SKILLS_META).map(sk => (
                  <option key={sk} value={sk}>
                    {MAIN_SKILLS_META[sk].iconSymbol} {sk}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Nivel</span>
                <span className="text-[10px] text-sky-400 font-bold">1-7</span>
              </label>
              <select
                value={mainSkillLevel}
                onChange={(e) => setMainSkillLevel(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-sky-400/40 rounded-xl text-xs text-sky-300 font-black focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono shadow-inner text-center"
                title="Nivel de Habilidad Principal (1 a 7)"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                  <option key={lvl} value={lvl} className="bg-slate-900 text-white font-bold">
                    Nv. {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección Ingredientes: 3 Slots con indicador activo según nivel */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>Ingredientes (Slots 1, 2 y 3)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Nivel actual: {level}
              </span>
            </div>

            <div className="space-y-2">
              {/* Slot 1: Nv 1 */}
              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 flex items-center gap-1 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Nv. 1:
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5 flex-shrink-0">
                  <img
                    src={getIngredientSpriteUrl(ing1Name)}
                    alt={ing1Name}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <select
                  value={ing1Name}
                  onChange={(e) => setIng1Name(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  {allIngredients.map(ing => (
                    <option key={ing} value={ing}>{ing}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 w-20">
                  <span className="text-slate-400 font-bold">×</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={ing1Count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setIng1Count('');
                      } else {
                        const parsed = parseInt(val, 10);
                        setIng1Count(isNaN(parsed) ? '' : Math.max(1, Math.min(15, parsed)));
                      }
                    }}
                    onBlur={() => {
                      if (ing1Count === '' || Number(ing1Count) < 1) setIng1Count(1);
                    }}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center"
                  />
                </div>
              </div>

              {/* Slot 2: Nv 30 */}
              <div className={`flex items-center gap-2 text-xs ${level !== '' && Number(level) >= 30 ? '' : 'opacity-70'}`}>
                <span className="w-16 flex items-center gap-1 font-semibold text-slate-300">
                  {level !== '' && Number(level) >= 30 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Nv. 30:
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5 flex-shrink-0">
                  <img
                    src={getIngredientSpriteUrl(ing2Name)}
                    alt={ing2Name}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <select
                  value={ing2Name}
                  onChange={(e) => setIng2Name(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  {allIngredients.map(ing => (
                    <option key={ing} value={ing}>{ing}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 w-20">
                  <span className="text-slate-400 font-bold">×</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={ing2Count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setIng2Count('');
                      } else {
                        const parsed = parseInt(val, 10);
                        setIng2Count(isNaN(parsed) ? '' : Math.max(1, Math.min(15, parsed)));
                      }
                    }}
                    onBlur={() => {
                      if (ing2Count === '' || Number(ing2Count) < 1) setIng2Count(2);
                    }}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center"
                  />
                </div>
              </div>

              {/* Slot 3: Nv 60 */}
              <div className={`flex items-center gap-2 text-xs ${level !== '' && Number(level) >= 60 ? '' : 'opacity-70'}`}>
                <span className="w-16 flex items-center gap-1 font-semibold text-slate-300">
                  {level !== '' && Number(level) >= 60 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  Nv. 60:
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5 flex-shrink-0">
                  <img
                    src={getIngredientSpriteUrl(ing3Name)}
                    alt={ing3Name}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <select
                  value={ing3Name}
                  onChange={(e) => setIng3Name(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  {allIngredients.map(ing => (
                    <option key={ing} value={ing}>{ing}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 w-20">
                  <span className="text-slate-400 font-bold">×</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={ing3Count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setIng3Count('');
                      } else {
                        const parsed = parseInt(val, 10);
                        setIng3Count(isNaN(parsed) ? '' : Math.max(1, Math.min(15, parsed)));
                      }
                    }}
                    onBlur={() => {
                      if (ing3Count === '' || Number(ing3Count) < 1) setIng3Count(3);
                    }}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subhabilidades (5 slots) */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-white mb-2">
              Subhabilidades (Nv 10, 25, 50, 75, 100)
            </div>
            <div className="space-y-1.5">
              {[10, 25, 50, 75, 100].map((unlockLvl, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="w-14 text-slate-400 text-[11px] font-mono">Nv. {unlockLvl}:</span>
                  <select
                    value={subskills[idx] || ''}
                    onChange={(e) => {
                      const newSubs = [...subskills];
                      newSubs[idx] = e.target.value;
                      setSubskills(newSubs);
                    }}
                    className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    <option value="">(Ninguna)</option>
                    {allSubskillNames.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Sinergia</label>
            <input
              type="text"
              placeholder="ej. Excelente farmeador de patatas, shiny, naturaleza perfecta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons (Pokemon GO Action Pills) */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {isEditing && onDelete && pokemonToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Estás seguro de que deseas eliminar a ${pokemonToEdit.name} de tu caja?`)) {
                    onDelete(pokemonToEdit.id);
                  }
                }}
                className="px-4 py-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Eliminar</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 sm:px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-500/25 active:scale-95 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isEditing ? 'Guardar Cambios' : 'Registrar Pokémon'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
