import React, { useState, useRef, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { scanPokemonScreenshot, PreFilledPokemonData, STORAGE_KEY_GEMINI_KEY } from '../services/ocrService';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optional custom API key configuration
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
  });
  const [isKeySaved, setIsKeySaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Global clipboard paste listener while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileProcess(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

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

  const handleFileProcess = async (file: File | Blob) => {
    setErrorMsg(null);
    setIsScanning(true);
    setScanStatus('Comprimiendo y preparando captura...');

    // Generate quick local preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      setScanStatus('Gemini 2.0 Flash Vision analizando la pantalla...');
      const result = await scanPokemonScreenshot(file, apiKey.trim() || undefined);

      setScanStatus('¡Lectura exitosa! Abriendo ficha del Pokémon...');
      setTimeout(() => {
        setIsScanning(false);
        onScanSuccess(result);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Scan error:', err);
      setIsScanning(false);
      setErrorMsg(err.message || 'Error al analizar la captura.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileProcess(file);
      } else {
        setErrorMsg('Por favor arrastra únicamente archivos de imagen.');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="cozy-card rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative border border-white/15 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none bg-indigo-500/20" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none bg-purple-500/20" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
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
                Pega o sube una captura de Pokémon Sleep para autollenar la ficha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 relative z-10">
          {/* Main Dropzone / Scanner Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] select-none ${
              isDragging
                ? 'border-purple-400 bg-purple-500/20 scale-[1.01]'
                : isScanning
                ? 'border-indigo-400/50 bg-indigo-950/40'
                : 'border-white/20 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/30 cursor-pointer'
            }`}
            onClick={() => {
              if (!isScanning) fileInputRef.current?.click();
            }}
          >
            {/* Hidden native inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
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
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />

            {/* SCANNING STATE WITH ANIMATED LASER SCANLINE */}
            {isScanning ? (
              <div className="flex flex-col items-center justify-center space-y-3 w-full py-2">
                {previewUrl && (
                  <div className="w-28 h-36 rounded-2xl overflow-hidden relative border border-white/20 shadow-2xl bg-black/40">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    {/* Laser Scanner Line */}
                    <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_2s_infinite]" />
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-bold text-purple-200">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  <span>{scanStatus}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Extrayendo especie, nivel, PA, naturaleza, ingredientes y subskills...
                </p>
              </div>
            ) : (
              /* IDLE / DROPZONE STATE */
              <>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-purple-200 mb-3 group-hover:scale-110 transition-transform shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base mb-1">
                  {isDragging ? 'Suelta la captura aquí' : 'Arrastra o toca para seleccionar captura'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mb-3">
                  Soporta capturas de la pantalla de datos del Pokémon o caja en formato JPG, PNG o WebP.
                </p>

                {/* Mobile Camera & File Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-dreamy-pearl px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <FileImage className="w-3.5 h-3.5 text-indigo-950" />
                    <span>Abrir Galería</span>
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
                  <span>Consejo: Puedes pulsar <strong className="text-white">Ctrl + V</strong> para pegar directamente</span>
                </div>
              </>
            )}
          </div>

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
                  Si estás usando la app en un entorno sin servidor o deseas tu propia cuota, puedes ingresar tu API Key gratuita de{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 underline font-bold"
                  >
                    Google AI Studio
                  </a>{' '}
                  (Gemini 2.0 Flash):
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
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span className="flex items-center gap-1 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Compatible con capturas en español e inglés
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
