import React, { useState } from 'react';
import { DishType, Recipe, SnorlaxConfig } from '../types/pokemon';
import { RECIPES, INGREDIENTS, DISH_LEVEL_BONUS } from '../data/gameData';
import { getIngredientSpriteUrl, getDishImageUrl } from '../services/pokeApiService';
import { Utensils, Soup, Salad, Coffee, Search, ChevronRight, Sparkles } from 'lucide-react';

interface RecipesViewProps {
  config?: SnorlaxConfig;
  onUpdateRecipeLevel?: (recipeName: string, level: number) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  config,
  onUpdateRecipeLevel
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
            <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
              78 Recetas
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Consulta los ingredientes requeridos y simula el vigor según el nivel del plato
          </p>
        </div>

        {/* Level Simulator Slider */}
        <div className="bg-[#08182c]/80 border border-sky-400/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-inner">
          <div className="text-xs">
            <span className="text-slate-400">Nivel de Plato: </span>
            <span className="font-bold text-sky-300 font-mono">Nv. {previewLevel}</span>
            <span className="text-emerald-400 text-[11px] ml-1.5 font-bold">(+{levelBonus}%)</span>
          </div>
          <input
            type="range"
            min="1"
            max="65"
            value={previewLevel}
            onChange={(e) => setPreviewLevel(parseInt(e.target.value, 10))}
            className="w-28 accent-sky-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 poke-card p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'all'
                ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold'
            }`}
          >
            Todos ({RECIPES.length})
          </button>
          <button
            onClick={() => setSelectedType('curry')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'curry'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-700/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold'
            }`}
          >
            <Soup className="w-3.5 h-3.5" /> Curris (25)
          </button>
          <button
            onClick={() => setSelectedType('salad')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'salad'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold'
            }`}
          >
            <Salad className="w-3.5 h-3.5" /> Ensaladas (26)
          </button>
          <button
            onClick={() => setSelectedType('dessert')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              selectedType === 'dessert'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold'
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
            className="w-full sm:w-64 pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 font-medium"
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
              className="poke-card pokeball-watermark p-5 rounded-3xl flex flex-col justify-between transition-all duration-200 group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-14 h-14 rounded-xl bg-slate-950/80 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
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
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-sky-300 transition-colors">
                          {recipe.name}
                        </h4>
                        {onUpdateRecipeLevel && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">Mi Nivel:</span>
                            <select
                              value={config?.recipeLevels?.[recipe.name] || 1}
                              onChange={(e) => onUpdateRecipeLevel(recipe.name, parseInt(e.target.value, 10))}
                              className="bg-slate-950 border border-slate-700 text-sky-300 font-bold text-xs rounded px-1.5 py-0.5 focus:ring-1 focus:ring-sky-400 focus:outline-none"
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
                        <div className="text-xs font-mono font-bold text-sky-300">
                          {scaledVigor.toLocaleString()} pts
                        </div>
                        {previewLevel > 1 && (
                          <div className="text-[10px] text-slate-500">
                            Base: {recipe.baseVigor.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Ingredientes</span>
                    <span>Total: {totalIngs}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(recipe.ingredients).map(([ing, count]) => (
                      <span
                        key={ing}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-slate-200 flex items-center gap-1.5 shadow-sm"
                      >
                        <img
                          src={getIngredientSpriteUrl(ing)}
                          alt={ing}
                          className="w-3.5 h-3.5 object-contain flex-shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span>{ing}</span>
                        <span className="text-amber-400 font-bold ml-0.5">×{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>{recipe.type === 'curry' ? '🍲' : recipe.type === 'salad' ? '🥗' : '☕'}</span>
                  <span className="capitalize">{recipe.type === 'curry' ? 'Guisos y Curris' : recipe.type === 'salad' ? 'Ensaladas' : 'Postres y Bebidas'}</span>
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Puchero mín: {totalIngs}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table of all Ingredients Base Vigor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 my-8">
        <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
          <span>🌾</span>
          <span>Tabla Oficial de Vigor de Ingredientes (Items Oficiales)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Cuando el puchero tiene espacios libres, los ingredientes sobrantes se suman como relleno. Aquí tienes el valor por unidad:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(INGREDIENTS)
            .sort((a, b) => b[1].vigor - a[1].vigor)
            .map(([name, meta]) => (
              <div
                key={name}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-2 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5 min-w-0 mr-1">
                  <img
                    src={getIngredientSpriteUrl(name)}
                    alt={name}
                    className="w-4 h-4 object-contain flex-shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <span className="text-slate-300 font-medium truncate">{name}</span>
                </div>
                <span className="font-bold font-mono text-amber-400 flex-shrink-0">
                  {meta.vigor}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
