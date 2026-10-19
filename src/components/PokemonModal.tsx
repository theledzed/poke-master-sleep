import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Pokemon, Specialty, IngredientSlot, Subskill } from '../types/pokemon';
import { BERRIES, INGREDIENTS, NATURES, KNOWN_SUBSKILLS, parseNature, CANONICAL_BERRIES } from '../data/gameData';
import { parseFrequency } from '../services/csvParser';
import {
  getPokemonArtworkUrl,
  getBerrySpriteUrl,
  getIngredientSpriteUrl,
  getPokemonCanonicalSkill,
  getMainSkillIconUrl,
  MAIN_SKILLS_META,
  SpriteStyle
} from '../services/pokeApiService';
import { getPokemonSkillLevel } from '../services/optimizer';
import {
  getSpeciesMasterData,
  SPECIES_MASTER_DATA,
  MasterSpecies
} from '../data/speciesMaster';
import { canPokemonEvolve } from '../services/evolutionService';
import { EvolutionModal } from './EvolutionModal';
import { X, Check, Plus, Trash2, Lock, CheckCircle2, Sparkles, Dna, Star, ChevronDown, Search, Wand2, RefreshCw } from 'lucide-react';

function formatFrequencySeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return s > 0 ? `${h}h ${m}min ${s}s` : `${h}h ${m}min`;
  return s > 0 ? `${m} min ${s}s` : `${m} min`;
}

function calculateDynamicFrequency(baseFrequency: number, lvl: number, nature: string): string {
  const nat = NATURES[nature];
  let speedMod = 1.0;
  if (nat?.upStat === 'Velocidad de ayuda') speedMod = 0.90;
  if (nat?.downStat === 'Velocidad de ayuda') speedMod = 1.10;
  const levelMod = Math.max(0.60, 1 - (lvl - 1) * 0.002);
  const totalSeconds = Math.round(baseFrequency * levelMod * speedMod);
  return formatFrequencySeconds(totalSeconds);
}

function searchMasterSpecies(query: string, limit = 8): MasterSpecies[] {
  if (!query || !query.trim()) {
    return SPECIES_MASTER_DATA.slice(0, limit);
  }
  const clean = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const isNumber = /^\d+$/.test(clean);
  const numVal = isNumber ? parseInt(clean, 10) : null;

  const exactMatches: MasterSpecies[] = [];
  const startsWith: MasterSpecies[] = [];
  const contains: MasterSpecies[] = [];

  for (const sp of SPECIES_MASTER_DATA) {
    if (numVal !== null && sp.dexNumber === numVal) {
      exactMatches.push(sp);
      continue;
    }
    const spClean = sp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (spClean === clean) {
      exactMatches.push(sp);
    } else if (spClean.startsWith(clean)) {
      startsWith.push(sp);
    } else if (spClean.includes(clean)) {
      contains.push(sp);
    }
    if (exactMatches.length + startsWith.length >= limit) break;
  }
  return [...exactMatches, ...startsWith, ...contains].slice(0, limit);
}

interface PokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pokemon: Pokemon) => void;
  onDelete?: (pokemonId: string) => void;
  pokemonToEdit?: Pokemon | null;
  spriteStyle?: SpriteStyle;
}

export const PokemonModal: React.FC<PokemonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  pokemonToEdit,
  spriteStyle = 'sleep'
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
  const [suggestions, setSuggestions] = useState<MasterSpecies[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Authoritative species match from datamined master
  const matchedMaster = useMemo(() => getSpeciesMasterData(name), [name]);

  // Evolution What-If modal state
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);

  // Dynamic draft pokemon representing the current modal state for evolution calculations
  const currentDraftPokemon: Pokemon = useMemo(() => {
    const numLevel = typeof level === 'number' ? level : parseInt(String(level), 10) || 1;
    const numRp = typeof rp === 'number' ? rp : parseInt(String(rp), 10) || 500;
    const parsedFreq = parseFrequency(frequencyStr);
    const natureObj = parseNature(natureName);

    return {
      id: pokemonToEdit ? pokemonToEdit.id : 'draft-evolution-poke',
      name: name.trim() || 'Charmander',
      frequencyStr,
      frequencySeconds: parsedFreq > 0 ? parsedFreq : (matchedMaster?.baseFrequency || 3600),
      level: numLevel,
      rp: numRp,
      specialty,
      nature: natureName,
      natureObj,
      berry,
      berryType: BERRIES[berry]?.type || 'Normal',
      ingredients: [
        { name: ing1Name, count: parseInt(String(ing1Count), 10) || 1, unlockLevel: 1, enabled: numLevel >= 1 },
        { name: ing2Name, count: parseInt(String(ing2Count), 10) || 2, unlockLevel: 30, enabled: numLevel >= 30 },
        { name: ing3Name, count: parseInt(String(ing3Count), 10) || 3, unlockLevel: 60, enabled: numLevel >= 60 }
      ],
      subskills: subskills.filter(s => s.trim().length > 0).map((subName, idx) => ({
        name: subName,
        tier: KNOWN_SUBSKILLS[subName]?.tier || 'white',
        description: KNOWN_SUBSKILLS[subName]?.description || '',
        unlockLevel: ([10, 25, 50, 75, 100][idx] || 100) as any,
        enabled: numLevel >= ([10, 25, 50, 75, 100][idx] || 100)
      })),
      notes,
      mainSkillName,
      mainSkillLevel
    };
  }, [
    pokemonToEdit,
    name,
    frequencyStr,
    level,
    rp,
    specialty,
    natureName,
    berry,
    ing1Name,
    ing1Count,
    ing2Name,
    ing2Count,
    ing3Name,
    ing3Count,
    subskills,
    notes,
    mainSkillName,
    mainSkillLevel,
    matchedMaster
  ]);

  const handleApplyEvolution = (evolved: Pokemon) => {
    setName(evolved.name);
    setSpecialty(evolved.specialty);
    setBerry(evolved.berry);
    setFrequencyStr(evolved.frequencyStr);
    setMainSkillName(evolved.mainSkillName || '');
    setMainSkillLevel(evolved.mainSkillLevel || 1);
    setRp(evolved.rp);
    if (evolved.notes) setNotes(evolved.notes);
    setIsEvolutionModalOpen(false);
  };

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
      const canonicalSkill = getPokemonCanonicalSkill(pokemonToEdit.name);
      let initialSkill = pokemonToEdit.mainSkillName || canonicalSkill;
      if (pokemonToEdit.name.toLowerCase().trim() === 'eevee' && initialSkill !== 'Imán ingredientes S') {
        initialSkill = 'Imán ingredientes S';
      } else if (initialSkill === 'Impulso de ayuda S' && !['raikou', 'entei', 'suicune'].some(b => pokemonToEdit.name.toLowerCase().includes(b))) {
        initialSkill = canonicalSkill;
      }
      setMainSkillName(initialSkill);
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

  const handleSelectSpecies = (entry: MasterSpecies) => {
    setName(entry.name);
    setSpecialty(entry.specialty);
    setBerry(entry.berry);
    setMainSkillName(entry.mainSkill);

    const numLvl = typeof level === 'number' ? level : parseInt(String(level), 10) || 25;
    const autoFreq = calculateDynamicFrequency(entry.baseFrequency, numLvl, natureName);
    setFrequencyStr(autoFreq);

    if (entry.ingredientSlots) {
      if (entry.ingredientSlots.slot1) {
        setIng1Name(entry.ingredientSlots.slot1.name);
        setIng1Count(entry.ingredientSlots.slot1.c1);
      }
      if (entry.ingredientSlots.slot2 && entry.ingredientSlots.slot2.name !== 'unknown') {
        setIng2Name(entry.ingredientSlots.slot2.name);
        setIng2Count(entry.ingredientSlots.slot2.c2);
      } else if (entry.ingredientSlots.slot1) {
        setIng2Name(entry.ingredientSlots.slot1.name);
        setIng2Count(entry.ingredientSlots.slot1.c2);
      }
      if (entry.ingredientSlots.slot3 && entry.ingredientSlots.slot3.name !== 'unknown') {
        setIng3Name(entry.ingredientSlots.slot3.name);
        setIng3Count(entry.ingredientSlots.slot3.c3);
      } else if (entry.ingredientSlots.slot2 && entry.ingredientSlots.slot2.name !== 'unknown') {
        setIng3Name(entry.ingredientSlots.slot2.name);
        setIng3Count(entry.ingredientSlots.slot2.c3);
      } else if (entry.ingredientSlots.slot1) {
        setIng3Name(entry.ingredientSlots.slot1.name);
        setIng3Count(entry.ingredientSlots.slot1.c3);
      }
    }
    setShowSuggestions(false);
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!pokemonToEdit) {
      const match = getSpeciesMasterData(newName);
      if (match && match.name.toLowerCase() === newName.toLowerCase().trim()) {
        setSpecialty(match.specialty);
        setBerry(match.berry);
        setMainSkillName(match.mainSkill);
        const numLvl = typeof level === 'number' ? level : parseInt(String(level), 10) || 25;
        setFrequencyStr(calculateDynamicFrequency(match.baseFrequency, numLvl, natureName));
        if (match.ingredientSlots) {
          if (match.ingredientSlots.slot1) {
            setIng1Name(match.ingredientSlots.slot1.name);
            setIng1Count(match.ingredientSlots.slot1.c1);
          }
          if (match.ingredientSlots.slot2 && match.ingredientSlots.slot2.name !== 'unknown') {
            setIng2Name(match.ingredientSlots.slot2.name);
            setIng2Count(match.ingredientSlots.slot2.c2);
          } else if (match.ingredientSlots.slot1) {
            setIng2Name(match.ingredientSlots.slot1.name);
            setIng2Count(match.ingredientSlots.slot1.c2);
          }
          if (match.ingredientSlots.slot3 && match.ingredientSlots.slot3.name !== 'unknown') {
            setIng3Name(match.ingredientSlots.slot3.name);
            setIng3Count(match.ingredientSlots.slot3.c3);
          } else if (match.ingredientSlots.slot2 && match.ingredientSlots.slot2.name !== 'unknown') {
            setIng3Name(match.ingredientSlots.slot2.name);
            setIng3Count(match.ingredientSlots.slot2.c3);
          } else if (match.ingredientSlots.slot1) {
            setIng3Name(match.ingredientSlots.slot1.name);
            setIng3Count(match.ingredientSlots.slot1.c3);
          }
        }
      }
    }
    setSuggestions(searchMasterSpecies(newName, 8));
    setShowSuggestions(true);
  };

  const handleRecalculateFrequency = () => {
    if (!matchedMaster) return;
    const numLvl = typeof level === 'number' ? level : parseInt(String(level), 10) || 25;
    setFrequencyStr(calculateDynamicFrequency(matchedMaster.baseFrequency, numLvl, natureName));
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

  const masterSlots = matchedMaster?.ingredientSlots;
  const slot1Cand = masterSlots?.slot1;
  const slot2Cand = masterSlots?.slot2;
  const slot3Cand = masterSlots?.slot3;

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
                src={getPokemonArtworkUrl(name || 'Pikachu', spriteStyle, isShiny)}
                alt={name || 'Pokemon'}
                className={`w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                  spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                }`}
                onError={(e) => { (e.target as HTMLElement).style.opacity = '0.4'; }}
              />
              {isShiny && (
                <span className="absolute -top-1 -right-1 bg-purple-300 text-indigo-950 p-0.5 rounded-full shadow animate-pulse">
                  <Sparkles className="w-3 h-3 fill-current" />
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{name || 'Escribe el nombre del Pokémon'}</span>
                  {isShiny && (
                    <span className="text-[10px] font-bold text-purple-200 bg-purple-500/20 border border-purple-400/40 px-1.5 py-0.2 rounded-full">
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
                    ? 'btn-dreamy-pearl text-indigo-950 shadow-md ring-2 ring-purple-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isShiny ? '✨ Variocolor / Shiny' : 'Forma Normal'}</span>
              </button>
            </div>
          </div>

          {/* Datamined Master Info Strip */}
          {matchedMaster && (
            <div className="p-3 bg-[var(--surface-inner)] border border-[var(--surface-border)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 flex-shrink-0">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{matchedMaster.name}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums font-bold">#{String(matchedMaster.dexNumber).padStart(3, '0')}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30 capitalize font-medium">
                      {matchedMaster.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-2 flex-wrap mt-0.5">
                    <span>Inventario: <strong className="text-white tabular-nums font-bold">{matchedMaster.carryLimit}</strong></span>
                    <span>•</span>
                    <span>Ratio Ingr: <strong className="text-emerald-300 tabular-nums font-bold">{matchedMaster.ingredientRate}%</strong></span>
                    <span>•</span>
                    <span>Ratio Hab: <strong className="text-white tabular-nums font-bold">{matchedMaster.skillRate}%</strong></span>
                    <span>•</span>
                    <span>Frec. Base: <strong className="text-white tabular-nums font-bold">{matchedMaster.frequencyStr}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                {canPokemonEvolve(name) && (
                  <button
                    type="button"
                    onClick={() => setIsEvolutionModalOpen(true)}
                    className="btn-dreamy-pearl flex items-center gap-1.5 px-3.5 py-1 rounded-full text-indigo-950 font-bold text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95"
                    title="Simular o aplicar evolución"
                  >
                    <Dna className="w-3.5 h-3.5 text-indigo-950" />
                    <span>Evolucionar (What-If)</span>
                  </button>
                )}
                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Base Oficial Pokémon Sleep</span>
                </div>
              </div>
            </div>
          )}

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
                    setSuggestions(searchMasterSpecies(name, 8));
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSuggestions(searchMasterSpecies(name, 8));
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
                  className="absolute left-0 right-0 top-full mt-1.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-white/10 backdrop-blur-xl"
                >
                  <div className="p-2 bg-[var(--surface-inner)] text-[10px] text-purple-200 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Especies de Pokémon Sleep</span>
                    <span className="text-slate-400 font-normal text-[9px]">Click para autocompletar</span>
                  </div>
                  {suggestions.map((entry) => {
                    const artworkUrl = getPokemonArtworkUrl(entry.name, spriteStyle, false);
                    const berrySprite = getBerrySpriteUrl(entry.berry);
                    const skillIcon = getMainSkillIconUrl(entry.mainSkill);
                    return (
                      <button
                        key={entry.name}
                        type="button"
                        onClick={() => handleSelectSpecies(entry)}
                        className="w-full text-left px-3 py-2.5 hover:bg-white/5 flex items-center justify-between gap-2 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center p-0.5 flex-shrink-0 group-hover:border-purple-400/40">
                            <img
                              src={artworkUrl}
                              alt={entry.name}
                              className={`w-full h-full object-contain ${
                                spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                              }`}
                              onError={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                            />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="tabular-nums font-bold text-[10px] text-slate-400">
                                #{String(entry.dexNumber).padStart(3, '0')}
                              </span>
                              <span className="font-bold text-xs text-white group-hover:text-purple-100 truncate">
                                {entry.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 truncate mt-0.5">
                              <span className="flex items-center gap-1 text-purple-200">
                                <img src={berrySprite} alt="" className="w-3 h-3 object-contain" />
                                <span>{entry.berry}</span>
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-slate-300 truncate">
                                <img src={skillIcon} alt="" className="w-3 h-3 object-contain" />
                                <span className="truncate">{entry.mainSkill}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border flex-shrink-0 ${
                          entry.specialty === 'Bayas'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : entry.specialty === 'Ingredientes'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : entry.specialty === 'Todo'
                            ? 'bg-purple-500/20 text-purple-200 border-purple-500/40'
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
                    const clamped = isNaN(parsed) ? '' : Math.max(1, Math.min(100, parsed));
                    setLevel(clamped);
                    if (!isEditing && matchedMaster && typeof clamped === 'number') {
                      setFrequencyStr(calculateDynamicFrequency(matchedMaster.baseFrequency, clamped, natureName));
                    }
                  }
                }}
                onBlur={() => {
                  if (level === '' || Number(level) < 1) setLevel(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400 tabular-nums font-bold"
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400 tabular-nums font-bold"
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Frecuencia</span>
                {matchedMaster && (
                  <button
                    type="button"
                    onClick={handleRecalculateFrequency}
                    className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 font-semibold hover:underline"
                    title="Recalcular automáticamente frecuencia según nivel y naturaleza"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-calc
                  </button>
                )}
              </label>
              <input
                type="text"
                placeholder="ej. 35 min 12s o 1h 5min"
                value={frequencyStr}
                onChange={(e) => setFrequencyStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400 tabular-nums font-bold"
              />
            </div>
          </div>

          {/* Fila 3: Naturaleza, Habilidad Principal y Nivel de Habilidad */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Naturaleza</label>
              <select
                value={natureName}
                onChange={(e) => {
                  const newNat = e.target.value;
                  setNatureName(newNat);
                  if (!isEditing && matchedMaster) {
                    const numLvl = typeof level === 'number' ? level : parseInt(String(level), 10) || 25;
                    setFrequencyStr(calculateDynamicFrequency(matchedMaster.baseFrequency, numLvl, newNat));
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src={getMainSkillIconUrl(mainSkillName)}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <select
                  value={mainSkillName}
                  onChange={(e) => setMainSkillName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium truncate"
                >
                  {Object.keys(MAIN_SKILLS_META).map(sk => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Nivel</span>
                <span className="text-[10px] text-purple-300 font-bold">1-7</span>
              </label>
              <select
                value={mainSkillLevel}
                onChange={(e) => setMainSkillLevel(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-2 bg-slate-950 border border-purple-400/40 rounded-xl text-xs text-purple-200 font-black focus:outline-none focus:ring-2 focus:ring-purple-400 tabular-nums shadow-inner text-center"
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

          {/* Sección Ingredientes: 3 Slots con indicador activo según nivel y botones de selección rápida oficial */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>Ingredientes (Slots 1, 2 y 3)</span>
                {matchedMaster && (
                  <span className="text-[10px] text-emerald-400 font-normal bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Opciones oficiales disponibles
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums font-bold">
                Nivel actual: {level}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Slot 1: Nv 1 */}
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Slot 1 (Nv. 1)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400/80 tabular-nums font-medium">Activo</span>
                </div>

                {slot1Cand && slot1Cand.name && slot1Cand.name !== 'unknown' && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400">Oficial:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIng1Name(slot1Cand.name);
                        setIng1Count(slot1Cand.c1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                        ing1Name === slot1Cand.name && Number(ing1Count) === slot1Cand.c1
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                          : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <img src={getIngredientSpriteUrl(slot1Cand.name)} alt="" className="w-4 h-4 object-contain" />
                      <span>{slot1Cand.name}</span>
                      <span className="tabular-nums font-black text-white">×{slot1Cand.c1}</span>
                      {ing1Name === slot1Cand.name && Number(ing1Count) === slot1Cand.c1 && (
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center p-0.5 flex-shrink-0">
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
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
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
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white tabular-nums font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 2: Nv 30 */}
              <div className={`p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 ${level !== '' && Number(level) >= 30 ? '' : 'opacity-85'}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-200">
                    {level !== '' && Number(level) >= 30 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-purple-400/80" />
                    )}
                    <span>Slot 2 (Nv. 30)</span>
                  </span>
                  <span className={`text-[10px] tabular-nums font-medium ${level !== '' && Number(level) >= 30 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {level !== '' && Number(level) >= 30 ? 'Desbloqueado' : 'Bloqueado (Nv. 30)'}
                  </span>
                </div>

                {masterSlots && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400">Opciones Oficiales:</span>
                    {slot1Cand && slot1Cand.name && slot1Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng2Name(slot1Cand.name);
                          setIng2Count(slot1Cand.c2);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                          ing2Name === slot1Cand.name && Number(ing2Count) === slot1Cand.c2
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <img src={getIngredientSpriteUrl(slot1Cand.name)} alt="" className="w-4 h-4 object-contain" />
                        <span>{slot1Cand.name}</span>
                        <span className="tabular-nums font-black text-white">×{slot1Cand.c2}</span>
                        {ing2Name === slot1Cand.name && Number(ing2Count) === slot1Cand.c2 && (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        )}
                      </button>
                    )}
                    {slot2Cand && slot2Cand.name && slot2Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng2Name(slot2Cand.name);
                          setIng2Count(slot2Cand.c2);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                          ing2Name === slot2Cand.name && Number(ing2Count) === slot2Cand.c2
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <img src={getIngredientSpriteUrl(slot2Cand.name)} alt="" className="w-4 h-4 object-contain" />
                        <span>{slot2Cand.name}</span>
                        <span className="tabular-nums font-black text-white">×{slot2Cand.c2}</span>
                        {ing2Name === slot2Cand.name && Number(ing2Count) === slot2Cand.c2 && (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center p-0.5 flex-shrink-0">
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
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
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
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white tabular-nums font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 3: Nv 60 */}
              <div className={`p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 ${level !== '' && Number(level) >= 60 ? '' : 'opacity-85'}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-200">
                    {level !== '' && Number(level) >= 60 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-purple-400/80" />
                    )}
                    <span>Slot 3 (Nv. 60)</span>
                  </span>
                  <span className={`text-[10px] tabular-nums font-medium ${level !== '' && Number(level) >= 60 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {level !== '' && Number(level) >= 60 ? 'Desbloqueado' : 'Bloqueado (Nv. 60)'}
                  </span>
                </div>

                {masterSlots && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400">Opciones Oficiales:</span>
                    {slot1Cand && slot1Cand.name && slot1Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng3Name(slot1Cand.name);
                          setIng3Count(slot1Cand.c3);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                          ing3Name === slot1Cand.name && Number(ing3Count) === slot1Cand.c3
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <img src={getIngredientSpriteUrl(slot1Cand.name)} alt="" className="w-4 h-4 object-contain" />
                        <span>{slot1Cand.name}</span>
                        <span className="tabular-nums font-black text-white">×{slot1Cand.c3}</span>
                        {ing3Name === slot1Cand.name && Number(ing3Count) === slot1Cand.c3 && (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        )}
                      </button>
                    )}
                    {slot2Cand && slot2Cand.name && slot2Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng3Name(slot2Cand.name);
                          setIng3Count(slot2Cand.c3);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                          ing3Name === slot2Cand.name && Number(ing3Count) === slot2Cand.c3
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <img src={getIngredientSpriteUrl(slot2Cand.name)} alt="" className="w-4 h-4 object-contain" />
                        <span>{slot2Cand.name}</span>
                        <span className="tabular-nums font-black text-white">×{slot2Cand.c3}</span>
                        {ing3Name === slot2Cand.name && Number(ing3Count) === slot2Cand.c3 && (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        )}
                      </button>
                    )}
                    {slot3Cand && slot3Cand.name && slot3Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng3Name(slot3Cand.name);
                          setIng3Count(slot3Cand.c3);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                          ing3Name === slot3Cand.name && Number(ing3Count) === slot3Cand.c3
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <img src={getIngredientSpriteUrl(slot3Cand.name)} alt="" className="w-4 h-4 object-contain" />
                        <span>{slot3Cand.name}</span>
                        <span className="tabular-nums font-black text-white">×{slot3Cand.c3}</span>
                        {ing3Name === slot3Cand.name && Number(ing3Count) === slot3Cand.c3 && (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center p-0.5 flex-shrink-0">
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
                    className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
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
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white tabular-nums font-bold text-center"
                    />
                  </div>
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
                  <span className="w-14 text-slate-400 text-[11px] tabular-nums font-bold">Nv. {unlockLvl}:</span>
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

      {/* Evolution What-If Modal */}
      {isEvolutionModalOpen && (
        <EvolutionModal
          isOpen={isEvolutionModalOpen}
          onClose={() => setIsEvolutionModalOpen(false)}
          pokemon={currentDraftPokemon}
          onConfirmEvolution={handleApplyEvolution}
          spriteStyle={spriteStyle}
        />
      )}
    </div>
  );
};
