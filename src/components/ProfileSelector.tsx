import React from 'react';
import { ProfileId, SyncStatus, PROFILES } from '../services/supabase';
import { CloudUpload, CloudCheck, AlertCircle, HardDrive } from 'lucide-react';

interface ProfileSelectorProps {
  activeProfile: ProfileId;
  onSelectProfile: (profileId: ProfileId) => void;
  syncStatus?: SyncStatus;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  activeProfile,
  onSelectProfile,
  syncStatus = 'local'
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Segmented Profile Switcher Pill */}
      <div className="flex items-center bg-[var(--surface-inner)] border border-[var(--surface-border)] rounded-full p-0.5 shadow-inner">
        <button
          type="button"
          onClick={() => onSelectProfile('cris')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-black transition-all ${
            activeProfile === 'cris'
              ? 'bg-white text-indigo-950 shadow-md shadow-white/20 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Perfil de Cris (Caja y Snorlax)"
        >
          <span className="text-sm leading-none">{PROFILES.cris.avatar}</span>
          <span className="hidden sm:inline font-bold">{PROFILES.cris.name}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectProfile('ady')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-black transition-all ${
            activeProfile === 'ady'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Perfil de Ady (Caja y Snorlax)"
        >
          <span className="text-sm leading-none">{PROFILES.ady.avatar}</span>
          <span className="hidden sm:inline font-bold">{PROFILES.ady.name}</span>
        </button>
      </div>

      {/* Cloud Sync Status Indicator */}
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--surface-inner)] border border-[var(--surface-border)] shadow-sm"
        title={
          syncStatus === 'syncing'
            ? 'Sincronizando con Supabase Cloud...'
            : syncStatus === 'synced'
            ? 'Sincronizado con Supabase Cloud'
            : syncStatus === 'error'
            ? 'Error de conexión con la nube (guardado en LocalStorage)'
            : 'Modo local (sin credenciales de Supabase)'
        }
      >
        {syncStatus === 'syncing' && (
          <CloudUpload className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        )}
        {syncStatus === 'synced' && (
          <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
        )}
        {syncStatus === 'error' && (
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        )}
        {syncStatus === 'local' && (
          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
        )}
      </div>
    </div>
  );
};
