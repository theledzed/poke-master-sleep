import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DishType, SnorlaxConfig } from '../types/pokemon';
import { INGREDIENTS } from '../data/gameData';
import { getIngredientSpriteUrl, getDishImageUrl } from '../services/pokeApiService';
import { scanPotScreenshots, ScannedPotData } from '../services/ocrService';
import { solveOptimalRecipes, SolvedRecipeResult } from '../services/recipeSolver';
import {
  Camera,
  Upload,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Flame,
  Zap,
  RotateCcw,
  Sliders,
  X,
  Copy,
  Check,
  Soup,
  Salad,
  Coffee,
  Info
} from 'lucide-react';

interface ChefAssistantViewProps {
  config?: SnorlaxConfig;
  onUpdateRecipeLevel?: (recipeName: string, level: number) => void;
}

export const ChefAssistantView: React.FC<ChefAssistantViewProps> = ({
  config,
  onUpdateRecipeLevel
}) => {
  // Screenshot upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanPercent, setScanPercent] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Live timer during pot scan
  useEffect(() => {
    let interval: any = null;
    if (isScanning) {
      const startTime = Date.now();
      setElapsedMs(0);
      interval = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
    } else {
      setElapsedMs(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Pot & Dish settings
  const [potSize, setPotSize] = useState<number>(() => config?.potSize || 57);
  const [islandBonus, setIslandBonus] = useState<number>(0); // e.g. +3%
  const [selectedType, setSelectedType] = useState<DishType | 'all'>(() => {
    return config?.dishType || 'all';
  });

  // Current detected / edited inventory
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [newIngName, setNewIngName] = useState<string>('');
  const [copiedRecipe, setCopiedRecipe] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle files selection (1 or 2 screenshots)
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).slice(0, 2); // max 2 screenshots
    setSelectedFiles(newFiles);

    const urls = newFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setScanError(null);
    setScanSuccess(false);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedUrls);
    if (updatedFiles.length === 0) {
      setScanError(null);
      setScanSuccess(false);
    }
  };

  // Perform OCR Scan with Gemini Vision
  const handleScan = async () => {
    if (selectedFiles.length === 0) return;
    setIsScanning(true);
    setScanError(null);
    setScanSuccess(false);
    setScanPercent(10);
    setScanStatus('Comprimiendo capturas a tamaño ultra ligero...');

    try {
      const result: ScannedPotData = await scanPotScreenshots(
        selectedFiles,
        undefined,
        (percent, status) => {
          setScanPercent(percent);
          setScanStatus(status);
        }
      );

      setScanPercent(100);
      setScanStatus('¡Olla analizada con éxito!');

      if (result.potCapacity && result.potCapacity > 0) {
        setPotSize(result.potCapacity);
      }

      if (result.dishType) {
        setSelectedType(result.dishType);
      }

      if (result.inventory && Object.keys(result.inventory).length > 0) {
        setInventory(result.inventory);
        setScanSuccess(true);
      } else {
        throw new Error('No se detectaron ingredientes en la captura. Asegúrate de que la cuadrícula sea visible.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Error al procesar la captura.');
    } finally {
      setIsScanning(false);
    }
  };

  // Modify ingredient count
  const handleUpdateQty = (name: string, delta: number) => {
    setInventory(prev => {
      const current = prev[name] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: updated };
    });
  };

  // Add new ingredient to inventory
  const handleAddIngredient = () => {
    if (!newIngName) return;
    setInventory(prev => ({
      ...prev,
      [newIngName]: (prev[newIngName] || 0) + 5
    }));
    setNewIngName('');
  };

  // Clear all inventory
  const handleClearInventory = () => {
    setInventory({});
    setScanSuccess(false);
  };

  // Run Optimal Recipe & Filler Solver
  const solved = useMemo(() => {
    return solveOptimalRecipes({
      inventory,
      potSize,
      dishType: selectedType,
      recipeLevels: config?.recipeLevels,
      islandBonusPercent: islandBonus
    });
  }, [inventory, potSize, selectedType, config?.recipeLevels, islandBonus]);

  const totalIngredientsCount = useMemo(() => {
    return Object.values(inventory).reduce((a, b) => a + b, 0);
  }, [inventory]);

  // Copy recipe & filler breakdown to clipboard
  const handleCopyRecipeBreakdown = (item: SolvedRecipeResult) => {
    const lines = [
      `🍲 ${item.recipe.name} (Vigor: ~${item.totalVigor.toLocaleString()} pts)`,
      `Base: ${Object.entries(item.recipe.ingredients).map(([n, c]) => `${n} ×${c}`).join(', ')}`,
      `Relleno (${item.fillerSlotsUsed} huecos): ${item.fillerItems.map(f => `${f.name} ×${f.count}`).join(', ')}`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedRecipe(item.recipe.name);
    setTimeout(() => setCopiedRecipe(null), 2000);
  };

  const allIngredientsList = useMemo(() => Object.keys(INGREDIENTS), []);

  return (
    <div className="space-y-6">
      {/* Hero Explainer & Scanner Section */}
      <div className="glass-dreamy pokeball-watermark p-5 sm:p-6 rounded-[28px] border border-white/10 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Chef Inteligente de Pokémon Sleep</span>
            </div>
            <h3 className="text-xl font-display font-black text-white flex items-center gap-2">
              <span>Escáner de Olla & Relleno de Máximo Vigor</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Sube 1 o 2 capturas de tu pantalla de cocina en el juego (donde dice <em>"Añadido: 0/{potSize}"</em>). Nuestro modelo de IA extraerá tu stock real y el algoritmo resolverá la receta de mayor puntaje junto con los <strong>ingredientes de relleno óptimos</strong> para llenar tu olla al 100%.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="bg-white/[0.06] border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-medium">Olla:</span>
              <span className="text-white font-black tabular-nums">{potSize} espacios</span>
            </div>
            {totalIngredientsCount > 0 && (
              <div className="bg-purple-500/20 border border-purple-400/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs">
                <span className="text-purple-200 font-medium">Stock:</span>
                <span className="text-white font-black tabular-nums">{totalIngredientsCount} items</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Zone & Previews */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Dropzone */}
          <div className="md:col-span-7">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-purple-400/60 rounded-3xl p-6 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.05] group flex flex-col items-center justify-center min-h-[160px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-md">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white block">
                {selectedFiles.length > 0
                  ? `Cambiar o añadir capturas (${selectedFiles.length}/2)`
                  : 'Sube 1 o 2 capturas de tu olla / pantalla de ingredientes'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG o capturas de tu teléfono móvil (hasta 2 para abarcar todo el scroll)
              </span>
            </div>

            {/* Selected image thumbnails */}
            {previewUrls.length > 0 && (
              <div className="flex items-center gap-3 mt-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-28 rounded-xl overflow-hidden border border-white/20 shadow-md flex-shrink-0">
                    <img src={url} alt={`Captura ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-500 transition-colors"
                      title="Eliminar captura"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] px-1.5 py-0.2 rounded text-white font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="btn-cozy-primary px-5 py-3 text-xs flex items-center gap-2 active:scale-95 transition-all shadow-lg ml-auto disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analizando con Gemini ({scanPercent}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>Escanear Olla con IA 📸</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Live Progress Bar during Scan */}
            {isScanning && (
              <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-400/30 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-200 flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                    <span>{scanStatus}</span>
                  </span>
                  <div className="flex items-center gap-2 tabular-nums flex-shrink-0">
                    <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                      ⏱️ {(elapsedMs / 1000).toFixed(1)}s
                    </span>
                    <span className="text-sm font-black text-white">{scanPercent}%</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-black/50 rounded-full border border-white/10 p-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(8, scanPercent))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scan Feedback alerts */}
            {scanSuccess && (
              <div className="mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>¡Olla escaneada con éxito!</strong> Se detectaron {Object.keys(inventory).length} ingredientes diferentes y una capacidad de {potSize} espacios.
                </span>
              </div>
            )}

            {scanError && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* Cooking Pot & Category Controls */}
          <div className="md:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-4 space-y-3.5">
            <div className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>Ajustes de Cocina</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-300 font-bold mb-1">Capacidad de Olla</label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={potSize}
                  onChange={(e) => setPotSize(Math.max(15, parseInt(e.target.value, 10) || 57))}
                  className="w-full bg-black/40 border border-white/15 text-white font-black text-sm rounded-xl px-3 py-2 tabular-nums focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-bold mb-1">Bono Evento / Isla (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={islandBonus}
                  onChange={(e) => setIslandBonus(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full bg-black/40 border border-white/15 text-white font-black text-sm rounded-xl px-3 py-2 tabular-nums focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Dish Type Filter */}
            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1.5">Categoría de Platillo</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedType('all')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedType === 'all'
                      ? 'bg-white text-indigo-950 font-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Todos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('curry')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedType === 'curry'
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Soup className="w-3.5 h-3.5" />
                  <span>Curris</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('salad')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedType === 'salad'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Salad className="w-3.5 h-3.5" />
                  <span>Ensaladas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('dessert')}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedType === 'dessert'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Postres</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Inventory Editor (Chips) */}
        {Object.keys(inventory).length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Despensa Actual ({Object.keys(inventory).length} ingredientes | {totalIngredientsCount} items):
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="bg-black/30 border border-white/15 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">+ Añadir otro ingrediente...</option>
                  {allIngredientsList
                    .filter(name => !inventory[name])
                    .map(name => (
                      <option key={name} value={name} className="bg-slate-900">
                        {name} (+{INGREDIENTS[name]?.vigor} pts)
                      </option>
                    ))}
                </select>
                {newIngName && (
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="btn-cozy-primary text-xs px-2.5 py-1"
                  >
                    Agregar +5
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClearInventory}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all text-xs"
                  title="Vaciar despensa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.entries(inventory)
                .sort((a, b) => (INGREDIENTS[b[0]]?.vigor || 0) - (INGREDIENTS[a[0]]?.vigor || 0))
                .map(([name, qty]) => {
                  const meta = INGREDIENTS[name];
                  return (
                    <div
                      key={name}
                      className="rounded-2xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-between gap-1.5 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={getIngredientSpriteUrl(name)}
                          alt={name}
                          className="w-5 h-5 object-contain flex-shrink-0"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div className="min-w-0">
                          <span className="text-[11px] text-white font-bold truncate block">
                            {name}
                          </span>
                          <span className="text-[9px] text-purple-300 tabular-nums">
                            {meta?.vigor || 90} pts
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(name, -1)}
                          className="w-5 h-5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center font-bold"
                          title="Restar 1"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-black text-white tabular-nums w-6 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(name, 1)}
                          className="w-5 h-5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center font-bold"
                          title="Sumar 1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h4 className="text-base font-display font-black text-white">
              Platillos Disponibles con Mayor Vigor ({solved.craftable.length})
            </h4>
          </div>
          <span className="text-xs text-slate-300">
            Ordenados de mayor a menor vigor final (Receta + Relleno Óptimo)
          </span>
        </div>

        {solved.craftable.length === 0 ? (
          <div className="poke-card p-8 rounded-3xl text-center space-y-3">
            <span className="text-3xl block">🧺</span>
            <h5 className="text-sm font-bold text-white">
              {totalIngredientsCount === 0
                ? 'Sube una captura de tu olla o añade ingredientes arriba para ver las recetas sugeridas.'
                : 'No tienes los ingredientes requeridos para completar ninguna receta de esta categoría.'}
            </h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Revisa la sección de <em>"Casi Listas"</em> abajo para ver qué platillos podrías hacer si consigues un par de ingredientes más.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solved.craftable.map((item, idx) => {
              const isTopPick = idx === 0;

              return (
                <div
                  key={item.recipe.id}
                  className={`rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group ${
                    isTopPick
                      ? 'bg-gradient-to-b from-purple-500/20 via-white/[0.06] to-white/[0.03] ring-1 ring-purple-300/50 shadow-xl shadow-purple-500/15 sm:-translate-y-1'
                      : 'cozy-card'
                  }`}
                >
                  {isTopPick && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <span>👑</span>
                      <span>Mayor Vigor</span>
                    </div>
                  )}

                  <div>
                    {/* Header info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/10 p-1 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                        <img
                          src={getDishImageUrl(item.recipe.name)}
                          alt={item.recipe.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 pr-12">
                        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                          #{idx + 1} • {item.recipe.type === 'curry' ? 'Curri' : item.recipe.type === 'salad' ? 'Ensalada' : 'Postre'}
                        </span>
                        <h5 className="text-sm font-black text-white truncate group-hover:text-purple-200 transition-colors">
                          {item.recipe.name}
                        </h5>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Nv. {item.level} (+{item.levelBonusPercent}%)
                        </div>
                      </div>
                    </div>

                    {/* Vigor Breakdown Box */}
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Receta base:</span>
                        <span className="text-slate-200 tabular-nums font-bold">
                          {item.scaledRecipeVigor.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-medium">
                          + Relleno ({item.fillerSlotsUsed} huecos):
                        </span>
                        <span className="text-emerald-300 tabular-nums font-black">
                          +{item.fillerScaledVigor.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-1.5 flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Vigor Total:
                        </span>
                        <span className="text-base font-black text-white tabular-nums">
                          ~{item.totalVigor.toLocaleString()} pts
                        </span>
                      </div>
                    </div>

                    {/* Base Ingredients needed */}
                    <div className="space-y-1.5 mb-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Ingredientes Base ({item.recipeSize} items):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.ingredientsRequired.map((ing) => (
                          <div
                            key={ing.name}
                            className="bg-white/5 border border-white/10 rounded-xl px-2 py-1 flex items-center gap-1.5 text-xs text-white"
                          >
                            <img
                              src={getIngredientSpriteUrl(ing.name)}
                              alt={ing.name}
                              className="w-3.5 h-3.5 object-contain"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <span className="text-[11px] font-medium">{ing.name}</span>
                            <span className="text-purple-300 font-bold tabular-nums">×{ing.required}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Optimal Filler Ingredients */}
                    {item.fillerItems.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        <div className="text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <span>✨</span>
                          <span>Relleno Óptimo Sugerido ({item.fillerSlotsUsed} items):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.fillerItems.map((filler) => (
                            <div
                              key={filler.name}
                              className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-2 py-1 flex items-center gap-1.5 text-xs text-emerald-100"
                              title={`${filler.name} (+${filler.vigorPerUnit} pts c/u)`}
                            >
                              <img
                                src={getIngredientSpriteUrl(filler.name)}
                                alt={filler.name}
                                className="w-3.5 h-3.5 object-contain"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <span className="text-[11px] font-bold">{filler.name}</span>
                              <span className="text-emerald-300 font-black tabular-nums">+{filler.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Olla: {item.recipeSize + item.fillerSlotsUsed} / {potSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRecipeBreakdown(item)}
                      className="flex items-center gap-1 text-[11px] text-purple-200 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {copiedRecipe === item.recipe.name ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar a la Olla</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Almost Craftable Recipes (Missing <= 5 items) */}
        {solved.almostCraftable.length > 0 && (
          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h5 className="text-sm font-display font-black text-white">
                Casi Listas (Faltan 1 a 5 ingredientes)
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {solved.almostCraftable.slice(0, 6).map((item) => (
                <div
                  key={item.recipe.id}
                  className="rounded-2xl p-4 bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={getDishImageUrl(item.recipe.name)}
                      alt={item.recipe.name}
                      className="w-10 h-10 object-contain rounded-xl bg-white/5 p-1 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">
                        {item.recipe.name}
                      </span>
                      <span className="text-[11px] text-amber-300 font-medium">
                        Faltan: {item.missingIngredients?.map(m => `${m.missing} ${m.name}`).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-slate-300 tabular-nums block">
                      ~{item.scaledRecipeVigor.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
