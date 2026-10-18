import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pokemon, SnorlaxConfig } from '../types/pokemon';
import { DEFAULT_CSV_DATA } from '../data/defaultPokedex';
import { parseCsvText } from './csvParser';

export type ProfileId = 'cris' | 'ady';

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';

export interface ProfileMeta {
  id: ProfileId;
  name: string;
  avatar: string;
  badgeColor: string;
}

export const PROFILES: Record<ProfileId, ProfileMeta> = {
  cris: {
    id: 'cris',
    name: 'Cris',
    avatar: '👦🏻',
    badgeColor: 'from-blue-600 to-sky-500'
  },
  ady: {
    id: 'ady',
    name: 'Ady',
    avatar: '👩🏻',
    badgeColor: 'from-pink-600 to-rose-400'
  }
};

export const STORAGE_KEY_ACTIVE_PROFILE = 'sleep_master_active_profile_v1';
const LEGACY_STORAGE_POKEDEX = 'sleep_master_pokedex_v1';
const LEGACY_STORAGE_CONFIG = 'sleep_master_config_v1';

export const DEFAULT_SNORLAX_CONFIG: SnorlaxConfig = {
  island: 'greengrass',
  dishType: 'curry',
  favoriteBerries: ['Baya Uvav', 'Baya Zanama', 'Baya Aranja'],
  potSize: 45,
  isSunday: false,
  recipeLevels: {},
  areaBonus: 0
};

// Check for Supabase environment variables (supports standard VITE_ and VITE_PUBLIC_ prefixes)
const metaEnv = ((import.meta as any).env || {}) as Record<string, string | undefined>;

const supabaseUrl = (
  metaEnv.VITE_PUBLIC_SUPABASE_URL ||
  metaEnv.VITE_SUPABASE_URL ||
  ''
).trim();

const supabaseAnonKey = (
  metaEnv.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isCloudSyncConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isCloudSyncConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage helpers per profile
export function getProfileStorageKeys(profileId: ProfileId) {
  return {
    pokedexKey: `sleep_master_pokedex_${profileId}_v1`,
    configKey: `sleep_master_config_${profileId}_v1`
  };
}

/**
 * Load initial profile data from LocalStorage with legacy migration for Cris
 */
export function loadProfileFromLocal(profileId: ProfileId): {
  pokemons: Pokemon[];
  config: SnorlaxConfig;
} {
  const { pokedexKey, configKey } = getProfileStorageKeys(profileId);

  // 1. Load Pokemons
  let pokemons: Pokemon[] = [];
  try {
    const savedPokedex = localStorage.getItem(pokedexKey);
    if (savedPokedex) {
      pokemons = JSON.parse(savedPokedex);
    } else if (profileId === 'cris') {
      // Migrate legacy data if available, else load default CSV
      const legacyPokedex = localStorage.getItem(LEGACY_STORAGE_POKEDEX);
      if (legacyPokedex) {
        pokemons = JSON.parse(legacyPokedex);
      } else {
        pokemons = parseCsvText(DEFAULT_CSV_DATA);
      }
      // Save migrated data to Cris's dedicated key
      localStorage.setItem(pokedexKey, JSON.stringify(pokemons));
    } else {
      // Ady starts clean!
      pokemons = [];
    }
  } catch (e) {
    console.error(`Error loading local pokedex for ${profileId}:`, e);
    pokemons = profileId === 'cris' ? parseCsvText(DEFAULT_CSV_DATA) : [];
  }

  // 2. Load Snorlax Config
  let config: SnorlaxConfig = { ...DEFAULT_SNORLAX_CONFIG };
  try {
    const savedConfig = localStorage.getItem(configKey);
    if (savedConfig) {
      config = { ...DEFAULT_SNORLAX_CONFIG, ...JSON.parse(savedConfig) };
    } else if (profileId === 'cris') {
      const legacyConfig = localStorage.getItem(LEGACY_STORAGE_CONFIG);
      if (legacyConfig) {
        config = { ...DEFAULT_SNORLAX_CONFIG, ...JSON.parse(legacyConfig) };
      }
      localStorage.setItem(configKey, JSON.stringify(config));
    }
  } catch (e) {
    console.error(`Error loading local config for ${profileId}:`, e);
    config = { ...DEFAULT_SNORLAX_CONFIG };
  }

  return { pokemons, config };
}

/**
 * Save profile data immediately to LocalStorage
 */
export function saveProfileToLocal(
  profileId: ProfileId,
  pokemons: Pokemon[],
  config: SnorlaxConfig
): void {
  const { pokedexKey, configKey } = getProfileStorageKeys(profileId);
  try {
    localStorage.setItem(pokedexKey, JSON.stringify(pokemons));
    localStorage.setItem(configKey, JSON.stringify(config));
  } catch (e) {
    console.error(`Error saving to local storage for ${profileId}:`, e);
  }
}

/**
 * Fetch profile data from Supabase Cloud (if configured)
 */
export async function fetchProfileFromCloud(profileId: ProfileId): Promise<{
  pokemons: Pokemon[];
  config: SnorlaxConfig;
  updatedAt?: string;
} | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('pokemons, snorlax_config, updated_at')
      .eq('id', profileId)
      .maybeSingle();

    if (error) {
      console.warn(`[CloudSync] Error fetching cloud profile for ${profileId}:`, error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    const pokemons = Array.isArray(data.pokemons) ? (data.pokemons as Pokemon[]) : [];
    const config = data.snorlax_config
      ? { ...DEFAULT_SNORLAX_CONFIG, ...(data.snorlax_config as SnorlaxConfig) }
      : { ...DEFAULT_SNORLAX_CONFIG };

    return {
      pokemons,
      config,
      updatedAt: data.updated_at
    };
  } catch (e) {
    console.warn(`[CloudSync] Network exception loading ${profileId}:`, e);
    return null;
  }
}

/**
 * Upsert profile data to Supabase Cloud
 */
export async function pushProfileToCloud(
  profileId: ProfileId,
  pokemons: Pokemon[],
  config: SnorlaxConfig
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: profileId,
        pokemons,
        snorlax_config: config,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn(`[CloudSync] Error pushing profile ${profileId} to cloud:`, error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.warn(`[CloudSync] Network exception pushing ${profileId}:`, e);
    return false;
  }
}

// Debounce manager for automatic background sync
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function cancelPendingCloudSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

export function queueCloudSync(
  profileId: ProfileId,
  pokemons: Pokemon[],
  config: SnorlaxConfig,
  onStatusChange?: (status: SyncStatus) => void,
  delayMs: number = 1500
): void {
  // Always update local storage synchronously first!
  saveProfileToLocal(profileId, pokemons, config);

  if (!isCloudSyncConfigured) {
    onStatusChange?.('local');
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  onStatusChange?.('syncing');

  debounceTimer = setTimeout(async () => {
    const success = await pushProfileToCloud(profileId, pokemons, config);
    if (success) {
      onStatusChange?.('synced');
    } else {
      onStatusChange?.('error');
    }
  }, delayMs);
}
