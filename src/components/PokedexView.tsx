import React, { useState, useMemo } from 'react';
import { Pokemon, Specialty } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { BERRIES, INGREDIENTS, CANONICAL_BERRIES } from '../data/gameData';
import { Search, Filter, ArrowUpDown, Plus, Sparkles, CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface PokedexViewProps {
  pokemons: Pokemon[];
  favoriteBerries: string[];
  onEditPokemon: (pokemon: Pokemon) => void;
  onAddNew: () => void;
  spriteStyle?: 'artwork' | 'showdown';
}

export const PokedexView: React.FC<PokedexViewProps> = ({
  pokemons,
  favoriteBerries,
  onEditPokemon,
  onAddNew,
  spriteStyle = 'artwork'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedBerry, setSelectedBerry] = useState<string>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'level' | 'rp' | 'name' | 'frequency'>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const specialties: Specialty[] = ['Bayas', 'Ingredientes', 'Habilidades', 'Todo'];
  const allIngredients = Object.keys(INGREDIENTS);

  const hasActiveFilters = searchTerm !== '' || selectedSpecialty !== 'all' || selectedBerry !== 'all' || selectedIngredient !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedBerry('all');
    setSelectedIngredient('all');
  };

  const filteredPokemons = useMemo(() => {
    return pokemons.filter(p => {
      // Search by name or note
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Specialty
      const matchesSpecialty = selectedSpecialty === 'all' || p.specialty === selectedSpecialty;

      // Berry
      const matchesBerry = selectedBerry === 'all' || p.berry === selectedBerry;

      // Ingredient
      const matchesIngredient =
        selectedIngredient === 'all' ||
        p.ingredients.some(ing => ing.name === selectedIngredient);

      return matchesSearch && matchesSpecialty && matchesBerry && matchesIngredient;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'level') comparison = a.level - b.level;
      if (sortBy === 'rp') comparison = a.rp - b.rp;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      if (sortBy === 'frequency') comparison = a.frequencySeconds - b.frequencySeconds;

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [pokemons, searchTerm, selectedSpecialty, selectedBerry, selectedIngredient, sortBy, sortOrder]);

  return (
    <div className="space-y-6 my-6">
      {/* Top action & title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 poke-card p-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Mi Caja de Ayudantes
            </h2>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
              {filteredPokemons.length} de {pokemons.length} Pokémon
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <span>✨ Desbloqueo progresivo: Nv. 1 (Slot 1), Nv. 30 (Slot 2) y Nv. 60 (Slot 3)</span>
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Nuevo Ayudante</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="poke-card p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-black uppercase tracking-wider pb-2 border-b border-white/10">
          <span className="flex items-center gap-1.5 text-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>Filtros y Búsqueda Rápida</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors normal-case font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre o nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all font-medium"
            />
          </div>

          {/* Specialty Filter */}
          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all font-bold"
            >
              <option value="all" className="bg-slate-900">🎯 Todas las especialidades</option>
              {specialties.map(spec => (
                <option key={spec} value={spec} className="bg-slate-900">
                  {spec === 'Bayas' ? '🍒' : spec === 'Ingredientes' ? '🥗' : spec === 'Habilidades' ? '⚡' : '🌟'} {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Berry Filter with Canonical list */}
          <div>
            <select
              value={selectedBerry}
              onChange={(e) => setSelectedBerry(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all font-bold"
            >
              <option value="all" className="bg-slate-900">🍒 Todas las bayas (18 tipos)</option>
              {CANONICAL_BERRIES.map(berry => (
                <option key={berry} value={berry} className="bg-slate-900">
                  {BERRIES[berry]?.icon || '🍒'} {berry} ({BERRIES[berry]?.type})
                </option>
              ))}
            </select>
          </div>

          {/* Ingredient Filter */}
          <div>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all font-bold"
            >
              <option value="all" className="bg-slate-900">🌾 Todos los ingredientes</option>
              {allIngredients.map(ing => (
                <option key={ing} value={ing} className="bg-slate-900">
                  {ing} ({INGREDIENTS[ing]?.vigor} pts)
                </option>
              ))}
            </select>
          </div>

          {/* Sort By & Order Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400/50 transition-all font-bold"
            >
              <option value="level" className="bg-slate-900">Ordenar por Nivel</option>
              <option value="rp" className="bg-slate-900">Ordenar por Poder (PA)</option>
              <option value="name" className="bg-slate-900">Ordenar por Nombre</option>
              <option value="frequency" className="bg-slate-900">Ordenar por Rapidez</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-full transition-all shadow-sm"
              title={sortOrder === 'desc' ? 'Orden: Descendente (mayor a menor)' : 'Orden: Ascendente (menor a mayor)'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Pokemon */}
      {filteredPokemons.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-4 text-3xl">
            🔍
          </div>
          <h3 className="font-bold text-white text-base mb-1">
            No se encontraron Pokémon
          </h3>
          <p className="text-slate-400 text-xs mb-4">
            No hay ningún Pokémon en tu caja que coincida con los criterios de búsqueda actuales.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPokemons.map(pokemon => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isFavoriteBerry={favoriteBerries.includes(pokemon.berry)}
              onEdit={onEditPokemon}
              spriteStyle={spriteStyle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
