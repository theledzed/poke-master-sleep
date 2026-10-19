import React, { useState } from 'react';
import { DishType, Recipe, SnorlaxConfig } from '../types/pokemon';
import { RECIPES, INGREDIENTS, DISH_LEVEL_BONUS } from '../data/gameData';
import { getIngredientSpriteUrl, getDishImageUrl } from '../services/pokeApiService';
import { Utensils, Soup, Salad, Coffee, Search, ChevronRight, Sparkles } from 'lucide-react';

interface RecipesViewProps {
  config?: SnorlaxConfig;
  onUpdateRecipeLevel?: (recipeName: string, level: number) => void;
  onUpdateAllRecipeLevels?: (levels: Record<string, number>) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  config,
  onUpdateRecipeLevel,
  onUpdateAllRecipeLevels
}) => {
  const [selectedType, setSelectedType] = useState<DishType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewLevel, setPreviewLevel] = useState<number>(1);

  const filteredRecipes = RECIPES.filter(r => {
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(r.ingredients).some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const levelBonus = DISH_LEVEL_BONUS[previewLevel] || 0;

  return (
    <div className="space-y-6 my-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 poke-card p-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍲</span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Recetario Oficial de Pokémon Sleep
            </h2>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 border border-purple-400/30">
              78 Recetas
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Consulta los ingredientes requeridos y guarda el nivel de tus platillos en la nube
          </p>
        </div>

        {/* Level Simulator Slider & Batch Save Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] px-4 py-2 rounded-full flex items-center gap-3 shadow-inner">
            <div className="text-xs whitespace-nowrap">
              <span className="text-[var(--text-muted)]">Nivel de Plato: </span>
              <span className="font-black text-white tabular-nums">Nv. {previewLevel}</span>
              <span className="text-emerald-400 text-[11px] ml-1.5 font-bold tabular-nums">(+{levelBonus}%)</span>
            </div>
            <input
              type="range"
              min="1"
              max="65"
              value={previewLevel}
              onChange={(e) => setPreviewLevel(parseInt(e.target.value, 10))}
              className="w-24 sm:w-28 accent-purple-400 cursor-pointer"
            />
          </div>

          {onUpdateAllRecipeLevels && (
            <button
              onClick={() => {
                const batch: Record<string, number> = {};
                filteredRecipes.forEach(r => {
                  batch[r.name] = previewLevel;
                });
                onUpdateAllRecipeLevels(batch);
              }}
              className="btn-cozy-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              title={`Guardar Nv. ${previewLevel} en Supabase para las ${filteredRecipes.length} recetas mostradas`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardar Nv. {previewLevel} ({filteredRecipes.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 poke-card p-3.5 rounded-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'all'
                ? 'btn-cozy-primary shadow-md'
                : 'bg-[var(--surface-inner)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--surface-border)] font-bold'
            }`}
          >
            Todos ({RECIPES.length})
          </button>
          <button
            onClick={() => setSelectedType('curry')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'curry'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black shadow-md border-b-2 border-orange-800'
                : 'bg-[var(--surface-inner)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--surface-border)] font-bold'
            }`}
          >
            <Soup className="w-3.5 h-3.5" /> Curris (25)
          </button>
          <button
            onClick={() => setSelectedType('salad')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'salad'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-md border-b-2 border-emerald-800'
                : 'bg-[var(--surface-inner)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--surface-border)] font-bold'
            }`}
          >
            <Salad className="w-3.5 h-3.5" /> Ensaladas (26)
          </button>
          <button
            onClick={() => setSelectedType('dessert')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'dessert'
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black shadow-md border-b-2 border-rose-800'
                : 'bg-[var(--surface-inner)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--surface-border)] font-bold'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" /> Postres (27)
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar receta o ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
          />
        </div>
      </div>

      {/* Grid of Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => {
          const totalIngs = Object.values(recipe.ingredients).reduce((a, b) => a + b, 0);
          const scaledVigor = Math.round(recipe.baseVigor * (1 + levelBonus / 100));

          return (
            <div
              key={recipe.id}
              className="cozy-card pokeball-watermark p-5 rounded-3xl flex flex-col justify-between transition-all duration-200 group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform shadow-inner">
                    <img
                      src={getDishImageUrl(recipe.name)}
                      alt={recipe.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fb = (e.target as HTMLElement).parentElement?.querySelector('.fallback-emoji');
                        if (fb) fb.classList.remove('hidden');
                      }}
                    />
                    <span className="fallback-emoji hidden text-2xl">
                      {recipe.type === 'curry' ? '🍲' : recipe.type === 'salad' ? '🥗' : '☕'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-black text-[var(--text-heading)] text-sm truncate group-hover:text-purple-200 transition-colors">
                          {recipe.name}
                        </h4>
                        {onUpdateRecipeLevel && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">Mi Nivel:</span>
                            <select
                              value={config?.recipeLevels?.[recipe.name] || 1}
                              onChange={(e) => onUpdateRecipeLevel(recipe.name, parseInt(e.target.value, 10))}
                              className="bg-white/10 border border-white/10 text-white font-black text-xs rounded-lg px-2 py-0.5 focus:ring-1 focus:ring-purple-400 focus:outline-none tabular-nums"
                              title="Guardar tu nivel de esta receta"
                            >
                              {Array.from({ length: 65 }, (_, idx) => idx + 1).map(lvl => (
                                <option key={lvl} value={lvl}>
                                  Nv. {lvl} (+{DISH_LEVEL_BONUS[lvl] || 0}%)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs tabular-nums font-black text-white">
                          {scaledVigor.toLocaleString()} pts
                        </div>
                        {previewLevel > 1 && (
                          <div className="text-[10px] text-[var(--text-muted)] tabular-nums">
                            Base: {recipe.baseVigor.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                    <span>Ingredientes</span>
                    <span className="tabular-nums font-bold">Total: {totalIngs}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(recipe.ingredients).map(([ing, count]) => (
                      <div
                        key={ing}
                        className="relative group/ing inline-flex items-center justify-center cursor-help"
                        title={`${ing} ×${count}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/[0.08] backdrop-blur-md p-1 flex items-center justify-center transition-transform hover:scale-110 shadow-sm">
                          <img
                            src={getIngredientSpriteUrl(ing)}
                            alt={ing}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 bg-indigo-950/90 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full border border-white/20 shadow-md tabular-nums select-none">
                          ×{count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>{recipe.type === 'curry' ? '🍲' : recipe.type === 'salad' ? '🥗' : '☕'}</span>
                  <span className="capitalize font-medium">{recipe.type === 'curry' ? 'Guisos y Curris' : recipe.type === 'salad' ? 'Ensaladas' : 'Postres y Bebidas'}</span>
                </span>
                <span className="bg-white/[0.06] px-2.5 py-0.5 rounded-full text-[var(--text-creamy)] tabular-nums font-bold">
                  Puchero mín: {totalIngs}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table of all Ingredients Base Vigor */}
      <div className="cozy-card p-5 my-8 rounded-3xl">
        <h3 className="font-black text-[var(--text-heading)] text-base mb-3 flex items-center gap-2">
          <span>🌾</span>
          <span>Tabla Oficial de Vigor de Ingredientes (Items Oficiales)</span>
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Cuando el puchero tiene espacios libres, los ingredientes sobrantes se suman como relleno. Aquí tienes el valor por unidad:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(INGREDIENTS)
            .sort((a, b) => b[1].vigor - a[1].vigor)
            .map(([name, meta]) => (
              <div
                key={name}
                className="bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl p-2.5 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5 min-w-0 mr-1">
                  <img
                    src={getIngredientSpriteUrl(name)}
                    alt={name}
                    className="w-4 h-4 object-contain flex-shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <span className="text-[var(--text-creamy)] font-medium truncate">{name}</span>
                </div>
                <span className="font-black tabular-nums text-white flex-shrink-0">
                  {meta.vigor}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
