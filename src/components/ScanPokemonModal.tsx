import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  UploadCloud,
  Sparkles,
  X,
  AlertCircle,
  Key,
  CheckCircle2,
  FileImage,
  Loader2,
  HelpCircle,
  Zap,
  Plus,
  Trash2,
  Layers,
  Check
} from 'lucide-react';
import {
  scanPokemonScreenshot,
  PreFilledPokemonData,
  STORAGE_KEY_GEMINI_KEY,
  ScanProgressStage
} from '../services/ocrService';

interface ScanPokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: PreFilledPokemonData) => void;
}

export const ScanPokemonModal: React.FC<ScanPokemonModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanPercent, setScanPercent] = useState<number>(0);
  const [scanStage, setScanStage] = useState<ScanProgressStage>('compressing');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live timer during scan
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

  // Optional custom API key configuration
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEMINI_KEY) : '') || '';
    } catch {
      return '';
    }
  });
  const [isKeySaved, setIsKeySaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slot2InputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scrolling when modal is open & add ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isScanning) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isScanning, onClose]);

  // Clean up object URLs when unmounting or changing files
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Helper to add files (up to max 2)
  const addFiles = useCallback((incomingFiles: File[]) => {
    setErrorMsg(null);
    const validImages = incomingFiles.filter((f) => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      setErrorMsg('Por favor selecciona únicamente archivos de imagen (JPG, PNG, WebP).');
      return;
    }

    setSelectedFiles((prev) => {
      const combined = [...prev, ...validImages].slice(0, 2);
      // Create new preview URLs for newly added items
      const newUrls = combined.map((file, idx) => {
        if (prev[idx] === file && previewUrls[idx]) {
          return previewUrls[idx];
        }
        return URL.createObjectURL(file);
      });
      // Revoke old ones not in newUrls
      previewUrls.forEach((oldUrl) => {
        if (!newUrls.includes(oldUrl)) URL.revokeObjectURL(oldUrl);
      });
      setPreviewUrls(newUrls);
      return combined;
    });
  }, [previewUrls]);

  // Helper to remove a single file
  const removeFile = (index: number) => {
    setErrorMsg(null);
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setErrorMsg(null);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  // Global clipboard paste listener while modal is open
  useEffect(() => {
    if (!isOpen || isScanning) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        addFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, isScanning, addFiles]);

  const handleSaveApiKey = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    }
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 2500);
  };

  const handleStartScan = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Por favor añade al menos 1 captura de Pokémon Sleep.');
      return;
    }

    setErrorMsg(null);
    setIsScanning(true);
    setScanPercent(10);
    setScanStage('compressing');
    setScanStatus('Comprimiendo capturas a tamaño ultra ligero...');

    try {
      const result = await scanPokemonScreenshot(
        selectedFiles,
        apiKey.trim() || undefined,
        (percent, status, stage) => {
          setScanPercent(percent);
          setScanStatus(status);
          setScanStage(stage);
        }
      );

      setScanPercent(100);
      setScanStage('done');
      setScanStatus('¡Lectura exitosa! Abriendo ficha del Pokémon...');
      setTimeout(() => {
        setIsScanning(false);
        onScanSuccess(result);
        onClose();
      }, 400);
    } catch (err: any) {
      console.error('Scan error:', err);
      setIsScanning(false);
      setErrorMsg(err.message || 'Error al analizar la captura.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isScanning) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      addFiles(filesArray);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={() => {
        if (!isScanning) onClose();
      }}
    >
      <div
        className="cozy-card rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl relative border border-white/15 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none bg-indigo-500/20" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none bg-purple-500/20" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Camera className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                <span>Escáner de Capturas</span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> IA Vision
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Sube 1 o 2 capturas para autollenar todos los datos del Pokémon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isScanning}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto overscroll-contain flex-1 relative z-10 pr-0.5 custom-scrollbar">
          {/* Hidden native inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(Array.from(e.target.files));
                e.target.value = '';
              }
            }}
          />
          <input
            ref={slot2InputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(Array.from(e.target.files));
                e.target.value = '';
              }
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(Array.from(e.target.files));
                e.target.value = '';
              }
            }}
          />

          {/* SCANNING IN PROGRESS DISPLAY */}
          {isScanning ? (
            <div className="border border-purple-500/40 bg-gradient-to-b from-indigo-950/70 via-purple-950/40 to-slate-950/90 rounded-3xl p-5 sm:p-6 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[310px] shadow-2xl animate-fade-in">
              {/* Laser scanner thumbnail preview */}
              <div className="flex items-center justify-center gap-3 w-full mb-4">
                {previewUrls.map((url, i) => (
                  <div
                    key={i}
                    className="w-24 sm:w-28 h-32 sm:h-36 rounded-2xl overflow-hidden relative border border-white/25 shadow-2xl bg-black/60"
                  >
                    <img src={url} alt={`Captura ${i + 1}`} className="w-full h-full object-cover opacity-85" />
                    {/* Animated Laser Scanner Line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_1.5s_infinite]" />
                    <div className="absolute bottom-1 inset-x-1 bg-black/75 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-200">
                      {i === 0 ? 'Parte 1 (Principal)' : 'Parte 2 (Scroll)'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status & Live Timer Header */}
              <div className="w-full max-w-md flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-purple-200 flex items-center gap-1.5 truncate max-w-[280px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{scanStatus}</span>
                </span>
                <div className="flex items-center gap-2 tabular-nums flex-shrink-0">
                  <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                    ⏱️ {(elapsedMs / 1000).toFixed(1)}s
                  </span>
                  <span className="text-sm font-black text-white">{scanPercent}%</span>
                </div>
              </div>

              {/* High-visibility Progress Bar with Glow */}
              <div className="w-full max-w-md h-3.5 bg-slate-900/90 rounded-full border border-white/15 p-0.5 relative overflow-hidden mb-4 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 transition-all duration-300 ease-out relative shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(6, scanPercent))}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* 4-Step Milestone Stepper */}
              <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-left mb-3">
                {[
                  { key: 'compressing', label: '1. Compresión', sub: '<90 KB' },
                  { key: 'uploading', label: '2. Conexión', sub: 'Gemini Flash' },
                  { key: 'analyzing', label: '3. Lectura IA', sub: 'Nivel & Skills' },
                  { key: 'validating', label: '4. Pokédex', sub: 'Cotejo oficial' }
                ].map((step, idx) => {
                  const stepOrder = ['compressing', 'uploading', 'analyzing', 'validating', 'done'];
                  const currentIdx = stepOrder.indexOf(scanStage);
                  const isDone = currentIdx > idx;
                  const isActive = currentIdx === idx;

                  return (
                    <div
                      key={step.key}
                      className={`p-2 rounded-xl border text-[10px] transition-all ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : isActive
                          ? 'bg-purple-950/60 border-purple-400/60 text-white shadow-sm ring-1 ring-purple-400/40'
                          : 'bg-white/[0.02] border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1 leading-tight">
                        {isDone ? (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        ) : isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        )}
                        <span className="truncate">{step.label}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">{step.sub}</div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 max-w-sm">
                💡 <strong className="text-white">Velocidad Pro:</strong> Redimensionado inteligente a 960px y Gemini 2.0 Flash para procesar en ~2 a 4 segundos.
              </p>
            </div>
          ) : selectedFiles.length === 0 ? (
            /* STATE 1: ZERO FILES SELECTED (DROPZONE) */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[230px] select-none cursor-pointer ${
                isDragging
                  ? 'border-purple-400 bg-purple-500/20 scale-[1.01]'
                  : 'border-white/20 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/30'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-purple-200 mb-3 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h4 className="font-bold text-white text-base mb-1">
                {isDragging ? 'Suelta tus capturas aquí' : 'Sube o arrastra tus capturas aquí'}
              </h4>

              <p className="text-xs text-slate-300 max-w-sm mb-3">
                Puedes subir <strong className="text-white">1 o 2 capturas</strong> del mismo Pokémon (ej. cabecera con stats + scroll con subskills).
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-dreamy-pearl px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <FileImage className="w-3.5 h-3.5 text-indigo-950" />
                  <span>Elegir Capturas (1 ó 2)</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-200" />
                  <span>Cámara</span>
                </button>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Consejo: Puedes presionar <strong className="text-white">Ctrl + V</strong> para pegar directamente</span>
              </div>
            </div>
          ) : (
            /* STATE 2: 1 OR 2 FILES SELECTED (SLOT SYSTEM) */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-300" />
                  <span>Capturas seleccionadas ({selectedFiles.length}/2):</span>
                </span>
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-[11px] text-red-300 hover:text-red-200 flex items-center gap-1 underline"
                >
                  <Trash2 className="w-3 h-3" /> Limpiar
                </button>
              </div>

              {/* Two Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* SLOT 1 (PRIMARY) */}
                <div className="relative rounded-2xl bg-white/[0.04] border border-white/15 p-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                    <span className="flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Captura 1 (Cabecera)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(0)}
                      className="p-1 rounded-lg bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-red-200 transition-colors"
                      title="Quitar captura 1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
                    <img
                      src={previewUrls[0]}
                      alt="Captura 1"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 truncate max-w-full">
                    {selectedFiles[0]?.name || 'Captura 1 cargada'}
                  </span>
                </div>

                {/* SLOT 2 (OPTIONAL / SCROLL) */}
                {selectedFiles.length >= 2 ? (
                  <div className="relative rounded-2xl bg-white/[0.04] border border-white/15 p-3 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                      <span className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Captura 2 (Scroll / Subskills)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(1)}
                        className="p-1 rounded-lg bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-red-200 transition-colors"
                        title="Quitar captura 2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
                      <img
                        src={previewUrls[1]}
                        alt="Captura 2"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1.5 truncate max-w-full">
                      {selectedFiles[1]?.name || 'Captura 2 cargada'}
                    </span>
                  </div>
                ) : (
                  /* SLOT 2 EMPTY INVITATION */
                  <div
                    onClick={() => slot2InputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className="rounded-2xl border-2 border-dashed border-purple-400/30 bg-purple-500/[0.04] hover:bg-purple-500/[0.08] hover:border-purple-400/50 p-4 flex flex-col items-center justify-center min-h-[190px] cursor-pointer transition-all text-center select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1">
                      + Añadir 2ª Captura (Opcional)
                    </h5>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mb-2">
                      Si hiciste scroll en el juego para ver las subskills (Lv 10-100), agrégala aquí.
                    </p>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                      Toca o pega (Ctrl+V)
                    </span>
                  </div>
                )}
              </div>

              {/* Informational Hint banner */}
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
                <Sparkles className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {selectedFiles.length === 2 ? (
                    <span>
                      <strong className="text-white">¡Excelente!</strong> Gemini Flash Vision combinará ambas capturas para extraer nivel, RP, naturaleza, todos los ingredientes y las 5 subhabilidades completas.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-white">1 captura lista:</strong> Si tu captura ya muestra todas las subskills puedes analizarla ahora mismo, o añadir la 2ª captura arriba para mayor precisión.
                    </span>
                  )}
                </div>
              </div>

              {/* Scan Trigger Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="w-full btn-dreamy-pearl py-3 rounded-2xl text-indigo-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {selectedFiles.length === 2
                      ? 'Analizar con IA (2 Capturas Combinadas)'
                      : 'Analizar con IA (1 Captura)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block mb-0.5">No se pudo procesar la captura:</span>
                <p className="opacity-90">{errorMsg}</p>
                {errorMsg.includes('API Key') && (
                  <button
                    type="button"
                    onClick={() => setShowKeyConfig(true)}
                    className="mt-2 text-[11px] font-bold text-amber-300 underline block hover:text-amber-200"
                  >
                    👉 Toca aquí para configurar tu clave de Gemini Flash gratis
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Optional API Key Configuration Drawer */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5">
            <button
              type="button"
              onClick={() => setShowKeyConfig((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-medium"
            >
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Configurar clave de IA (Opcional / Personal)</span>
              </div>
              <span className="text-[10px] text-purple-200 font-bold">
                {showKeyConfig ? 'Ocultar' : 'Configurar'}
              </span>
            </button>

            {showKeyConfig && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 animate-fade-in text-xs">
                <p className="text-[11px] text-slate-400">
                  Si deseas usar tu propia cuota o la app corre en un servidor sin backend configurado, puedes ingresar tu API Key gratuita de{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 underline font-bold"
                  >
                    Google AI Studio
                  </a>{' '}
                  (Gemini 2.0 / 2.5 Flash):
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="btn-dreamy-pearl px-3 py-1.5 text-xs font-bold"
                  >
                    Guardar
                  </button>
                </div>

                {isKeySaved && (
                  <div className="text-[11px] text-emerald-300 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Clave guardada correctamente en tu dispositivo
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10 flex-shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Compatible con capturas en español e inglés
          </span>
          <button
            onClick={onClose}
            disabled={isScanning}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all text-xs disabled:opacity-40"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
