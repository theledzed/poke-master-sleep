import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
import { PreFilledPokemonData } from '../services/ocrService';
import { ScanPokemonModal } from './ScanPokemonModal';
import {
  evaluatePokemonWithCollection,
  PokemonAuditResult,
  FamilyComparisonSummary
} from '../services/pokedexEvaluator';
import { SpeciesComparisonModal } from './SpeciesComparisonModal';
import { X, Check, Plus, Trash2, Lock, CheckCircle2, Sparkles, Dna, Star, ChevronDown, Search, Wand2, RefreshCw, Camera, Crown, Trophy, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

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
  preFillData?: PreFilledPokemonData | null;
  existingPokemons?: Pokemon[];
}

export const PokemonModal: React.FC<PokemonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  pokemonToEdit,
  spriteStyle = 'sleep',
  preFillData,
  existingPokemons = []
}) => {
  const isEditing = Boolean(pokemonToEdit);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [wasAutoFilled, setWasAutoFilled] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isFamilyComparisonModalOpen, setIsFamilyComparisonModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const [name, setName] = useState('');
  const [isShiny, setIsShiny] = useState(false);
  const [level, setLevel] = useState<number | string>(25);
  const [rp, setRp] = useState<number | string>(1000);
  const [frequencyStr, setFrequencyStr] = useState('45 min 0s');
  const [carryLimit, setCarryLimit] = useState<number | string>('');
  const [specialty, setSpecialty] = useState<Specialty>('Bayas');
  const [berry, setBerry] = useState<string>('Baya Caquic');
  const [isBerryDropdownOpen, setIsBerryDropdownOpen] = useState(false);
  const berryDropdownRef = useRef<HTMLDivElement>(null);
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
      carryLimit: typeof carryLimit === 'number' ? carryLimit : parseInt(String(carryLimit), 10) || matchedMaster?.carryLimit || 16,
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
    carryLimit,
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

  const dynamicLiveEvaluation: PokemonAuditResult | null = useMemo(() => {
    if (!showEvaluation) return null;
    return evaluatePokemonWithCollection(currentDraftPokemon, existingPokemons);
  }, [showEvaluation, currentDraftPokemon, existingPokemons]);

  const handleApplyEvolution = (evolved: Pokemon) => {
    setName(evolved.name);
    setSpecialty(evolved.specialty);
    setBerry(evolved.berry);
    setFrequencyStr(evolved.frequencyStr);
    setMainSkillName(evolved.mainSkillName || '');
    setMainSkillLevel(evolved.mainSkillLevel || 1);
    setRp(evolved.rp);
    if (evolved.carryLimit) setCarryLimit(evolved.carryLimit);
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
      if (
        berryDropdownRef.current &&
        !berryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBerryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyPreFill = (data: PreFilledPokemonData) => {
    setName(data.name);
    setIsShiny(data.isShiny);
    setLevel(data.level);
    setRp(data.rp);
    setFrequencyStr(data.frequencyStr);
    if (data.carryLimit !== undefined && data.carryLimit > 0) {
      setCarryLimit(data.carryLimit);
    }
    setSpecialty(data.specialty);
    setBerry(data.berry);
    setNatureName(data.natureName);
    setMainSkillName(data.mainSkillName);
    setMainSkillLevel(data.mainSkillLevel);
    setNotes(data.notes);
    setIng1Name(data.ing1Name);
    setIng1Count(data.ing1Count);
    setIng2Name(data.ing2Name);
    setIng2Count(data.ing2Count);
    setIng3Name(data.ing3Name);
    setIng3Count(data.ing3Count);
    setSubskills(data.subskills);
    setWasAutoFilled(true);
    setShowEvaluation(true);
  };

  useEffect(() => {
    if (pokemonToEdit) {
      setName(pokemonToEdit.name);
      setIsShiny(Boolean(pokemonToEdit.notes?.toLowerCase().includes('shiny') || pokemonToEdit.notes?.toLowerCase().includes('variocolor')));
      setLevel(pokemonToEdit.level);
      setRp(pokemonToEdit.rp);
      setFrequencyStr(pokemonToEdit.frequencyStr);
      const masterInfo = getSpeciesMasterData(pokemonToEdit.name);
      setCarryLimit(pokemonToEdit.carryLimit !== undefined ? pokemonToEdit.carryLimit : (masterInfo?.carryLimit ?? ''));
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
      setWasAutoFilled(false);
    } else if (preFillData) {
      applyPreFill(preFillData);
    } else {
      // Defaults for new Pokemon
      setName('');
      setIsShiny(false);
      setLevel(15);
      setRp(750);
      setFrequencyStr('45 min 0s');
      setCarryLimit('');
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
      setWasAutoFilled(false);
    }
    setShowSuggestions(false);
  }, [pokemonToEdit, preFillData, isOpen]);

  const handleSelectSpecies = (entry: MasterSpecies) => {
    setName(entry.name);
    setSpecialty(entry.specialty);
    setBerry(entry.berry);
    setMainSkillName(entry.mainSkill);
    if (entry.carryLimit) {
      setCarryLimit(entry.carryLimit);
    }

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
        if (match.carryLimit) {
          setCarryLimit(match.carryLimit);
        }
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
    const finalCarryLimit = typeof carryLimit === 'number' ? carryLimit : (parseInt(String(carryLimit), 10) || undefined);
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
      carryLimit: finalCarryLimit,
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="glass-dreamy rounded-[32px] border border-white/15 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative my-auto overflow-hidden animate-fade-in">
        {/* Header - Pinned */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.04] backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isEditing ? '✏️' : '✨'}</span>
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                {isEditing ? `Editar a ${pokemonToEdit?.name}` : 'Dar de Alta Nuevo Pokémon'}
              </h3>
              <p className="text-xs text-slate-300">
                Formato idéntico a tu base de datos maestra de Pokémon Sleep
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="btn-dreamy-pearl px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 text-indigo-950 shadow-md hover:scale-[1.02] active:scale-95"
                title="Escanear captura de pantalla de Pokémon Sleep"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-950" />
                <span className="hidden sm:inline">Escanear Captura</span>
                <span className="sm:hidden">Captura</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Container - Flex column holding scrollable body + pinned footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 custom-scrollbar">
            {/* Autofilled Success Banner */}
            {wasAutoFilled && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-between text-xs text-emerald-200 animate-fade-in relative z-10 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>¡Ficha autollenada con éxito desde tu captura con IA! Revisa los datos y guarda.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWasAutoFilled(false)}
                  className="text-emerald-400 hover:text-white ml-2 p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          {/* Live Pokemon Preview & Shiny Switch */}
          <div className="flex items-center gap-3.5 p-3.5 bg-white/[0.05] rounded-2xl border border-white/10 shadow-inner">
            <div className={`w-16 h-16 rounded-2xl p-1 flex items-center justify-center relative flex-shrink-0 shadow-inner overflow-hidden transition-all ${
              isShiny
                ? 'bg-gradient-to-tr from-amber-400/25 via-pink-400/20 to-purple-400/25 ring-2 ring-amber-300/40 shadow-amber-400/20 shadow-md'
                : 'bg-white/10'
            }`}>
              <img
                src={getPokemonArtworkUrl(name || 'Pikachu', spriteStyle, isShiny)}
                alt={name || 'Pokemon'}
                className={`w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                  spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                }`}
                onError={(e) => { (e.target as HTMLElement).style.opacity = '0.4'; }}
              />
              {isShiny && (
                <span className="absolute -top-1 -right-1 bg-amber-300 text-indigo-950 p-0.5 rounded-full shadow animate-pulse">
                  <Sparkles className="w-3 h-3 fill-current" />
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{name || 'Escribe el nombre del Pokémon'}</span>
                  {isShiny && (
                    <span className="text-[10px] font-bold text-amber-200 bg-amber-400/20 border border-amber-300/40 px-2 py-0.2 rounded-full">
                      Variocolor
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-300">
                  Ilustración y sprites oficiales sincronizados con PokeAPI
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsShiny(prev => !prev)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto select-none ${
                  isShiny
                    ? 'btn-dreamy-pearl shadow-lg'
                    : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isShiny ? '✨ Variocolor / Shiny' : 'Forma Normal'}</span>
              </button>
            </div>
          </div>

          {/* Datamined Master Info Strip */}
          {matchedMaster && (
            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
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

          {/* Live Genetic Evaluation & Box Duplicate Comparison Section */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all shadow-sm">
            <div className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>Evaluador Genético & Auditor de Caja</span>
                    {showEvaluation && dynamicLiveEvaluation && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${dynamicLiveEvaluation.verdictBadgeColor}`}>
                        {dynamicLiveEvaluation.verdictLabel}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Diagnóstico de calidad genética y comparación con ejemplares de su misma especie en tu caja.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEvaluation(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                  showEvaluation
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30'
                    : 'btn-dreamy-pearl text-indigo-950 font-black shadow-md hover:scale-[1.02] active:scale-95'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showEvaluation ? 'Ocultar Análisis' : '✨ Evaluar Potencial'}</span>
              </button>
            </div>

            {showEvaluation && dynamicLiveEvaluation && (
              <div className="p-4 border-t border-white/10 space-y-3.5 bg-black/25 animate-fade-in">
                {/* Tier, Score, and Verdict Banner */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-center shadow-md">
                      <span className="text-[10px] uppercase tracking-wider block opacity-80 leading-none">Grado</span>
                      <span className="text-base font-black leading-tight">{dynamicLiveEvaluation.tier}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">{dynamicLiveEvaluation.geneticScore} / 100 pts</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${dynamicLiveEvaluation.verdictBadgeColor}`}>
                          {dynamicLiveEvaluation.verdictLabel}
                        </span>
                        {dynamicLiveEvaluation.isMonoIngredient && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
                            🥣 Mono-Ingrediente
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {dynamicLiveEvaluation.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Action Suggestion Pill */}
                  <div className="text-right flex-shrink-0 self-start sm:self-auto">
                    {dynamicLiveEvaluation.verdict === 'CAMBIAR_CARAMELOS' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-xl border border-rose-500/40">
                        🍬 Sugerencia: Descartar
                      </span>
                    ) : dynamicLiveEvaluation.verdict === 'TITULAR_ELITE' || dynamicLiveEvaluation.verdict === 'PROMESA_INVERTIR' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                        ✓ Sugerencia: Guardar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-sky-300 bg-sky-500/20 px-2.5 py-1 rounded-xl border border-sky-400/40">
                        🛠️ Sugerencia: Guardar (Nicho)
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual Meters */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px]">
                  <div>
                    <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Rendimiento Hoy
                      </span>
                      <span className="text-amber-300 font-black">{dynamicLiveEvaluation.currentPowerScore}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, dynamicLiveEvaluation.currentPowerScore))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Techo Nv. 50
                      </span>
                      <span className="text-purple-300 font-black">{dynamicLiveEvaluation.ceilingScore}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, dynamicLiveEvaluation.ceilingScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Duplicate / Box Peer Comparison Spotlight */}
                {dynamicLiveEvaluation.familyComparison && dynamicLiveEvaluation.speciesTotal && dynamicLiveEvaluation.speciesTotal > 1 ? (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-400/30 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👥</span>
                        <span className="text-xs font-black text-white">
                          Comparación con tu Caja ({dynamicLiveEvaluation.speciesTotal} en Familia {dynamicLiveEvaluation.familyComparison.familyName})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsFamilyComparisonModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-400/30 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span>⚔️ Comparar Frente a Frente</span>
                      </button>
                    </div>

                    <div className="text-xs">
                      {dynamicLiveEvaluation.isSpeciesBest ? (
                        <p className="text-amber-200 font-semibold flex items-center gap-1.5">
                          <span>👑</span>
                          <span>¡Nuevo Mejor de tu Caja! Supera a tus otros ejemplares de esta familia ({dynamicLiveEvaluation.familyComparison.totalMembers} en caja).</span>
                        </p>
                      ) : (
                        <p className="text-slate-300 font-medium leading-relaxed">
                          Queda en puesto <strong className="text-white">#{dynamicLiveEvaluation.speciesRank} de {dynamicLiveEvaluation.speciesTotal}</strong>. Tu mejor ejemplar registrado es <strong className="text-amber-300">{dynamicLiveEvaluation.familyComparison.bestMemberName}</strong>.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
                    <span>✨</span>
                    <span>Sería tu primer ejemplar registrado de esta familia en tu caja.</span>
                  </div>
                )}

                {/* Pros & Cons List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {dynamicLiveEvaluation.pros.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-400 block">Puntos Fuertes:</span>
                      {dynamicLiveEvaluation.pros.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="text-[11px] text-slate-200 flex items-start gap-1 leading-snug">
                          <span className="text-emerald-400 font-bold leading-none mt-0.5">•</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {dynamicLiveEvaluation.cons.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-black uppercase text-rose-400 block">Puntos Débiles:</span>
                      {dynamicLiveEvaluation.cons.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="text-[11px] text-rose-200 flex items-start gap-1 leading-snug">
                          <span className="text-rose-400 font-bold leading-none mt-0.5">•</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                    setSuggestions(searchMasterSpecies(name, 8));
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-3 pr-8 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 font-medium transition-all"
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
                  className="absolute left-0 right-0 top-full mt-1.5 bg-indigo-950/95 border border-white/15 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-white/10 backdrop-blur-2xl"
                >
                  <div className="p-2 bg-white/[0.05] text-[10px] text-purple-200 font-semibold uppercase tracking-wider flex items-center justify-between">
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
                          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0 group-hover:border-purple-400/40">
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
                className="w-full px-3 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 tabular-nums font-bold transition-all"
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
                className="w-full px-3 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 tabular-nums font-bold transition-all"
              />
            </div>
          </div>

          {/* Fila 2: Especialidad, Baya, Frecuencia, Capacidad de la Bolsa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Especialidad</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as Specialty)}
                className="w-full px-3 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/30 font-medium transition-all"
              >
                <option value="Bayas" className="bg-slate-900 text-white">Bayas (+1 Baya base)</option>
                <option value="Ingredientes" className="bg-slate-900 text-white">Ingredientes (Mayor cuota)</option>
                <option value="Habilidades" className="bg-slate-900 text-white">Habilidades (2 activaciones)</option>
                <option value="Todo" className="bg-slate-900 text-white">Todo (Bayas + Ingr + Habilidades)</option>
              </select>
            </div>

            {/* Custom Interactive Berry Picker with Real PNG Sprites */}
            <div className="relative" ref={berryDropdownRef}>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Baya</label>
              <button
                type="button"
                onClick={() => setIsBerryDropdownOpen(prev => !prev)}
                className="w-full px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 focus:border-white/30 rounded-xl text-xs text-slate-100 flex items-center justify-between gap-1.5 transition-all group"
                title="Elegir baya oficial con sprite"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-lg bg-black/20 border border-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                    <img
                      src={getBerrySpriteUrl(berry)}
                      alt={berry}
                      className="w-5 h-5 object-contain filter drop-shadow-sm"
                    />
                  </div>
                  <div className="text-left truncate">
                    <span className="font-bold text-white text-xs block truncate leading-tight">{berry.replace('Baya ', '')}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{BERRIES[berry]?.type || 'Normal'}</span>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform flex-shrink-0 ${isBerryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBerryDropdownOpen && (
                <div className="absolute left-0 right-0 sm:w-72 top-full mt-1.5 bg-[#0e1628]/98 border border-white/20 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto overscroll-contain divide-y divide-white/5 backdrop-blur-2xl animate-fade-in custom-scrollbar">
                  <div className="p-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
                    <span>18 Bayas Oficiales</span>
                    <span className="text-[9px] text-slate-400 font-normal">Click para elegir</span>
                  </div>
                  <div className="pt-1 space-y-1">
                    {CANONICAL_BERRIES.map(b => {
                      const meta = BERRIES[b];
                      const isSelected = berry === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setBerry(b);
                            setIsBerryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-all ${
                            isSelected
                              ? 'bg-purple-500/25 border border-purple-400/40 text-white font-bold'
                              : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center p-0.5 flex-shrink-0">
                              <img
                                src={getBerrySpriteUrl(b)}
                                alt={b}
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold block truncate">{b}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Tipo {meta?.type || 'Normal'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] tabular-nums font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full flex-shrink-0">
                            {meta?.baseVigor || 25} pts
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                    <RefreshCw className="w-3 h-3" /> Auto
                  </button>
                )}
              </label>
              <input
                type="text"
                placeholder="ej. 35 min 12s"
                value={frequencyStr}
                onChange={(e) => setFrequencyStr(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 tabular-nums font-bold transition-all"
              />
            </div>

            {/* Capacidad de la Bolsa (carryLimit) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Capacidad Bolsa</span>
                {matchedMaster && (
                  <button
                    type="button"
                    onClick={() => setCarryLimit(matchedMaster.carryLimit)}
                    className="text-[10px] text-sky-300 hover:text-sky-200 font-semibold hover:underline"
                    title={`Restablecer a base oficial (${matchedMaster.carryLimit})`}
                  >
                    Base: {matchedMaster.carryLimit}
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="99"
                  placeholder={matchedMaster ? String(matchedMaster.carryLimit) : 'ej. 24'}
                  value={carryLimit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCarryLimit('');
                    } else {
                      const parsed = parseInt(val, 10);
                      setCarryLimit(isNaN(parsed) ? '' : Math.max(1, Math.min(99, parsed)));
                    }
                  }}
                  className="w-full pl-3 pr-11 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 tabular-nums font-bold transition-all"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                  slots
                </span>
              </div>
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
                className="w-full px-3 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/30 font-medium transition-all"
              >
                {Object.keys(NATURES).map(natKey => {
                  const nat = NATURES[natKey];
                  const label = nat.upStat
                    ? `${nat.name} (+${nat.upStat}, -${nat.downStat})`
                    : `${nat.name} (Neutra / Sin efecto)`;
                  return (
                    <option key={natKey} value={natKey} className="bg-slate-900 text-white">
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Habilidad Principal</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center p-1 flex-shrink-0">
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
                  className="w-full px-3 py-2 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/10 focus:border-white/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/30 font-medium truncate transition-all"
                >
                  {Object.keys(MAIN_SKILLS_META).map(sk => (
                    <option key={sk} value={sk} className="bg-slate-900 text-white">
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
                className="w-full px-2.5 py-2 bg-white/[0.08] border border-purple-300/30 rounded-xl text-xs text-purple-200 font-black focus:outline-none focus:ring-1 focus:ring-purple-300/50 tabular-nums shadow-inner text-center transition-all"
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
          <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>Ingredientes (Slots 1, 2 y 3)</span>
                {matchedMaster && (
                  <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/25">
                    Opciones oficiales disponibles
                  </span>
                )}
              </span>
              <span className="text-[11px] text-white/60 tabular-nums font-semibold">
                Nivel actual: {level}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Slot 1: Nv 1 */}
              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Slot 1 (Nv. 1)</span>
                  </span>
                  <span className="text-[10px] text-emerald-300/90 tabular-nums font-semibold">Activo</span>
                </div>

                {slot1Cand && slot1Cand.name && slot1Cand.name !== 'unknown' && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-white/50">Oficial:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIng1Name(slot1Cand.name);
                        setIng1Count(slot1Cand.c1);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                        ing1Name === slot1Cand.name && Number(ing1Count) === slot1Cand.c1
                          ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                          : 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200'
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
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1 flex-shrink-0 backdrop-blur-sm">
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
                    className="flex-1 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                  >
                    {allIngredients.map(ing => (
                      <option key={ing} value={ing} className="bg-slate-900 text-white font-medium">{ing}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-white/50 font-bold">×</span>
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
                      className="w-full px-2 py-1.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white tabular-nums font-bold text-center focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 2: Nv 30 */}
              <div className={`p-3 bg-white/[0.03] rounded-2xl border border-white/5 space-y-2 ${level !== '' && Number(level) >= 30 ? '' : 'opacity-80'}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-200">
                    {level !== '' && Number(level) >= 30 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-purple-300/80" />
                    )}
                    <span>Slot 2 (Nv. 30)</span>
                  </span>
                  <span className={`text-[10px] tabular-nums font-semibold ${level !== '' && Number(level) >= 30 ? 'text-emerald-300' : 'text-white/40'}`}>
                    {level !== '' && Number(level) >= 30 ? 'Desbloqueado' : 'Bloqueado (Nv. 30)'}
                  </span>
                </div>

                {masterSlots && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-white/50">Opciones Oficiales:</span>
                    {slot1Cand && slot1Cand.name && slot1Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng2Name(slot1Cand.name);
                          setIng2Count(slot1Cand.c2);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                          ing2Name === slot1Cand.name && Number(ing2Count) === slot1Cand.c2
                            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                            : 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200'
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
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                          ing2Name === slot2Cand.name && Number(ing2Count) === slot2Cand.c2
                            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                            : 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200'
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
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1 flex-shrink-0 backdrop-blur-sm">
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
                    className="flex-1 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                  >
                    {allIngredients.map(ing => (
                      <option key={ing} value={ing} className="bg-slate-900 text-white font-medium">{ing}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-white/50 font-bold">×</span>
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
                      className="w-full px-2 py-1.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white tabular-nums font-bold text-center focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 3: Nv 60 */}
              <div className={`p-3 bg-white/[0.03] rounded-2xl border border-white/5 space-y-2 ${level !== '' && Number(level) >= 60 ? '' : 'opacity-80'}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-200">
                    {level !== '' && Number(level) >= 60 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-purple-300/80" />
                    )}
                    <span>Slot 3 (Nv. 60)</span>
                  </span>
                  <span className={`text-[10px] tabular-nums font-semibold ${level !== '' && Number(level) >= 60 ? 'text-emerald-300' : 'text-white/40'}`}>
                    {level !== '' && Number(level) >= 60 ? 'Desbloqueado' : 'Bloqueado (Nv. 60)'}
                  </span>
                </div>

                {masterSlots && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-white/50">Opciones Oficiales:</span>
                    {slot1Cand && slot1Cand.name && slot1Cand.name !== 'unknown' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIng3Name(slot1Cand.name);
                          setIng3Count(slot1Cand.c3);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                          ing3Name === slot1Cand.name && Number(ing3Count) === slot1Cand.c3
                            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                            : 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200'
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
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                          ing3Name === slot2Cand.name && Number(ing3Count) === slot2Cand.c3
                            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                            : 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200'
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
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                          ing3Name === slot3Cand.name && Number(ing3Count) === slot3Cand.c3
                            ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10'
                            : 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200'
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
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1 flex-shrink-0 backdrop-blur-sm">
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
                    className="flex-1 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                  >
                    {allIngredients.map(ing => (
                      <option key={ing} value={ing} className="bg-slate-900 text-white font-medium">{ing}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-white/50 font-bold">×</span>
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
                      className="w-full px-2 py-1.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white tabular-nums font-bold text-center focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subhabilidades (5 slots) */}
          <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
              <span>Subhabilidades</span>
              <span className="text-[10px] text-white/50 font-medium">Nv 10, 25, 50, 75, 100</span>
            </div>
            <div className="space-y-2">
              {[10, 25, 50, 75, 100].map((unlockLvl, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="w-14 text-white/60 text-[11px] tabular-nums font-bold">Nv. {unlockLvl}:</span>
                  <select
                    value={subskills[idx] || ''}
                    onChange={(e) => {
                      const newSubs = [...subskills];
                      newSubs[idx] = e.target.value;
                      setSubskills(newSubs);
                    }}
                    className="flex-1 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                  >
                    <option value="" className="bg-slate-900 text-white font-medium">(Ninguna)</option>
                    {allSubskillNames.map(s => (
                      <option key={s} value={s} className="bg-slate-900 text-white font-medium">{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">Notas / Sinergia</label>
            <input
              type="text"
              placeholder="ej. Excelente farmeador de patatas, shiny, naturaleza perfecta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
            />
          </div>

          </div>

          {/* Sticky/Pinned Action Buttons Footer */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-white/10 bg-[#0d1326]/95 backdrop-blur-xl relative z-20">
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
            ) : !isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Descartar este Pokémon y salir sin guardarlo en tu Pokédex?')) {
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                title="Descartar este ejemplar sin guardarlo en tu caja"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Descartar y No Guardar</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              {!showEvaluation && (
                <button
                  type="button"
                  onClick={() => setShowEvaluation(true)}
                  className="px-3.5 py-2.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                  title="Evaluar calidad genética y comparar con caja"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden sm:inline">Evaluar Potencial</span>
                  <span className="sm:hidden">Evaluar</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-dreamy-pearl px-7 py-2.5 rounded-full text-indigo-950 text-xs font-black uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-95 flex items-center gap-2 transition-all"
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

      {/* Screenshot OCR Scanner Modal */}
      {isScanModalOpen && (
        <ScanPokemonModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onScanSuccess={applyPreFill}
        />
      )}

      {/* Evolutionary Family Side-by-Side Comparison Modal */}
      {isFamilyComparisonModalOpen && dynamicLiveEvaluation?.familyComparison && (
        <SpeciesComparisonModal
          isOpen={isFamilyComparisonModalOpen}
          onClose={() => setIsFamilyComparisonModalOpen(false)}
          summary={dynamicLiveEvaluation.familyComparison}
          spriteStyle={spriteStyle}
        />
      )}
    </div>,
    document.body
  );
};
