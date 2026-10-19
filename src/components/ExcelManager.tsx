import React, { useRef, useState } from 'react';
import { Pokemon } from '../types/pokemon';
import { parseExcelFile, parseCsvText, exportPokemonsToCsv } from '../services/csvParser';
import { DEFAULT_CSV_DATA } from '../data/defaultPokedex';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ExcelManagerProps {
  pokemons: Pokemon[];
  onUpdatePokemons: (newPokemons: Pokemon[]) => void;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({
  pokemons,
  onUpdatePokemons
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isCsv = file.name.endsWith('.csv');

    reader.onload = (event) => {
      try {
        let loadedPokemons: Pokemon[] = [];
        if (isCsv) {
          const text = event.target?.result as string;
          loadedPokemons = parseCsvText(text);
        } else {
          const buffer = event.target?.result as ArrayBuffer;
          loadedPokemons = parseExcelFile(buffer);
        }

        if (loadedPokemons.length === 0) {
          setStatusMessage({ type: 'error', text: 'No se encontraron filas válidas en el archivo.' });
          return;
        }

        onUpdatePokemons(loadedPokemons);
        setStatusMessage({
          type: 'success',
          text: `¡Éxito! Se han cargado ${loadedPokemons.length} Pokémon desde ${file.name}.`
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Error al procesar el archivo: ${err.message || 'Formato no compatible'}`
        });
      }
    };

    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExportExcel = () => {
    const rows = pokemons.map(p => ({
      'Nombre': p.name,
      'Frecuencia ': p.frequencyStr,
      'Nivel': p.level,
      'PA (Poder de Ayuda)': p.rp,
      'Especialidad': p.specialty,
      'Naturaleza': p.nature,
      'Ingredientes': p.ingredients.map(ing => `${ing.name} x${ing.count}`).join(', '),
      'Subhabilidades': p.subskills.map(s => s.name).join(', '),
      'Fecha de Encuentro': p.encounterDate || '',
      'Horas de Sueño': p.sleepHours || '',
      'Sinergia / Estrategia': p.notes || '',
      'Baya': p.berry
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja 1');
    XLSX.writeFile(workbook, 'Pokemon_Sleep_Base_de_Datos_Actualizada.xlsx');

    setStatusMessage({
      type: 'success',
      text: '¡Archivo Excel exportado exitosamente!'
    });
  };

  const handleExportCsv = () => {
    const csvContent = exportPokemonsToCsv(pokemons);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Pokemon_Sleep_Base_de_Datos_Actualizada.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMessage({
      type: 'success',
      text: '¡Archivo CSV exportado exitosamente!'
    });
  };

  const handleRestoreDefault = () => {
    if (window.confirm('¿Restablecer la base de datos a los 57 Pokémon originales de tu archivo maestro?')) {
      const defaultList = parseCsvText(DEFAULT_CSV_DATA);
      onUpdatePokemons(defaultList);
      setStatusMessage({
        type: 'success',
        text: 'Se han restaurado los 57 Pokémon originales de tu base de datos maestra.'
      });
    }
  };

  return (
    <div className="space-y-6 my-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span>Gestión de Base de Datos y Sincronización Excel</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Importa o actualiza tu base de datos desde Excel (.xlsx) o CSV, o descarga los datos con tus cambios aplicados.
        </p>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Import / Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Import Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-black/20">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              Importar / Actualizar desde Excel o CSV
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Sube tu archivo de Excel (.xlsx, .xls) o CSV. La app respetará tus columnas exactas y actualizará tu lista en tiempo real.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Seleccionar Archivo Excel o CSV</span>
            </button>
          </div>
        </div>

        {/* Export Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-black/20">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">
              Exportar Base de Datos Actualizada
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Descarga tu base de datos actual ({pokemons.length} Pokémon) con cualquier edición o nuevo Pokémon que hayas dado de alta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .XLSX</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex-1 py-3 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Summary & Reset */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-lg shadow-black/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
              <span>📊</span>
              <span>Estado de la Base de Datos Local</span>
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
              <span>Total: <strong className="text-white font-semibold">{pokemons.length} Pokémon</strong></span>
              <span>•</span>
              <span>Especialistas Bayas: <strong className="text-purple-300 font-semibold">{pokemons.filter(p => p.specialty === 'Bayas').length}</strong></span>
              <span>•</span>
              <span>Especialistas Ingredientes: <strong className="text-emerald-400 font-semibold">{pokemons.filter(p => p.specialty === 'Ingredientes').length}</strong></span>
              <span>•</span>
              <span>Especialistas Habilidades: <strong className="text-purple-400 font-semibold">{pokemons.filter(p => p.specialty === 'Habilidades').length}</strong></span>
            </div>
          </div>

          <button
            onClick={handleRestoreDefault}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Datos Originales</span>
          </button>
        </div>
      </div>
    </div>
  );
};
