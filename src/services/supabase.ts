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
  accentColor: string;
}

export const PROFILES: Record<ProfileId, ProfileMeta> = {
  cris: {
    id: 'cris',
    name: 'Cris',
    avatar: '👦🏻',
    accentColor: 'from-blue-600 to-sky-500'
  },
  ady: {
    id: 'ady',
    name: 'Ady',
    avatar: '👩🏻',
    accentColor: 'from-pink-600 to-rose-400'
  }
};

export const DEFAULT_SNORLAX_CONFIG: SnorlaxConfig = {
  island: 'greengrass',
  dishType: 'curry',
  favoriteBerries: ['Baya Uvav', 'Baya Zanama', 'Baya Aranja'],
  potSize: 45,
  isSunday: false,
  recipeLevels: {},
  areaBonus: 0
};

export const STORAGE_KEY_ACTIVE_PROFILE = 'pokesleep_active_profile';

// Environment variables from Vite
const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

const supabaseUrl = (
  env.VITE_PUBLIC_SUPABASE_URL ||
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  ''
).trim();

const supabaseAnonKey = (
  env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage key helpers per profile
export function getLocalStorageKeys(profileId: ProfileId) {
  return {
    boxKey: `pokesleep_box_${profileId}`,
    configKey: `pokesleep_config_${profileId}`,
    legacyBoxKey: `sleep_master_pokedex_${profileId}_v1`,
    legacyConfigKey: `sleep_master_config_${profileId}_v1`
  };
}

/**
 * Synchronous local reader for instantaneous UI render (0ms response)
 */
export function getProfileFromLocal(profileId: ProfileId): {
  pokemons: Pokemon[];
  config: SnorlaxConfig;
} {
  const { boxKey, configKey, legacyBoxKey, legacyConfigKey } = getLocalStorageKeys(profileId);

  // 1. Pokemons
  let pokemons: Pokemon[] = [];
  try {
    const saved = localStorage.getItem(boxKey) || localStorage.getItem(legacyBoxKey);
    if (saved) {
      pokemons = JSON.parse(saved);
    } else if (profileId === 'cris') {
      // Migrate initial box from legacy master storage or default CSV
      const oldLegacy = localStorage.getItem('sleep_master_pokedex_v1');
      if (oldLegacy) {
        pokemons = JSON.parse(oldLegacy);
      } else {
        pokemons = parseCsvText(DEFAULT_CSV_DATA);
      }
      localStorage.setItem(boxKey, JSON.stringify(pokemons));
    } else {
      // Ady starts completely clean
      pokemons = [];
    }
  } catch (err) {
    console.error(`Error reading local box for ${profileId}:`, err);
    pokemons = profileId === 'cris' ? parseCsvText(DEFAULT_CSV_DATA) : [];
  }

  // 2. Snorlax Config
  let config: SnorlaxConfig = { ...DEFAULT_SNORLAX_CONFIG };
  try {
    const savedConfig = localStorage.getItem(configKey) || localStorage.getItem(legacyConfigKey);
    if (savedConfig) {
      config = { ...DEFAULT_SNORLAX_CONFIG, ...JSON.parse(savedConfig) };
    } else if (profileId === 'cris') {
      const oldConfig = localStorage.getItem('sleep_master_config_v1');
      if (oldConfig) {
        config = { ...DEFAULT_SNORLAX_CONFIG, ...JSON.parse(oldConfig) };
      }
      localStorage.setItem(configKey, JSON.stringify(config));
    }
  } catch (err) {
    console.error(`Error reading local config for ${profileId}:`, err);
    config = { ...DEFAULT_SNORLAX_CONFIG };
  }

  return { pokemons, config };
}

/**
 * Saves profile data immediately to LocalStorage
 */
export function saveProfileToLocal(
  profileId: ProfileId,
  pokemons: Pokemon[],
  config: SnorlaxConfig
): void {
  const { boxKey, configKey, legacyBoxKey, legacyConfigKey } = getLocalStorageKeys(profileId);
  try {
    const pokemonsStr = JSON.stringify(pokemons);
    const configStr = JSON.stringify(config);

    localStorage.setItem(boxKey, pokemonsStr);
    localStorage.setItem(configKey, configStr);

    // Keep legacy keys updated as mirror backup
    localStorage.setItem(legacyBoxKey, pokemonsStr);
    localStorage.setItem(legacyConfigKey, configStr);
  } catch (err) {
    console.error(`Error saving to localStorage for ${profileId}:`, err);
  }
}

/**
 * Loads profile data: returns local cache immediately and fetches from Supabase if available.
 */
export async function loadProfileData(profileId: ProfileId): Promise<{
  pokemons: Pokemon[];
  config: SnorlaxConfig;
  isCloud: boolean;
}> {
  // Always retrieve local copy first
  const localData = getProfileFromLocal(profileId);

  if (!supabase || !isSupabaseConfigured) {
    return { ...localData, isCloud: false };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('pokemons, snorlax_config, updated_at')
      .eq('id', profileId)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Error loading profile "${profileId}":`, error.message);
      return { ...localData, isCloud: false };
    }

    if (data && Array.isArray(data.pokemons)) {
      const cloudPokemons = data.pokemons as Pokemon[];
      const cloudConfig = data.snorlax_config
        ? { ...DEFAULT_SNORLAX_CONFIG, ...(data.snorlax_config as SnorlaxConfig) }
        : localData.config;

      // Protective safeguard: If cloud was newly created with empty '[]' (from migration SQL),
      // but local storage already has Pokémon (e.g. Cris's 57 Pokémon), preserve local and upload it!
      if (cloudPokemons.length === 0 && localData.pokemons.length > 0) {
        await saveProfileData(profileId, localData.pokemons, cloudConfig);
        return {
          pokemons: localData.pokemons,
          config: cloudConfig,
          isCloud: true
        };
      }

      // Update local storage with fresh cloud data
      saveProfileToLocal(profileId, cloudPokemons, cloudConfig);

      return {
        pokemons: cloudPokemons,
        config: cloudConfig,
        isCloud: true
      };
    } else {
      // Cloud record does not exist yet; initialize cloud with local data
      await saveProfileData(profileId, localData.pokemons, localData.config);
      return { ...localData, isCloud: true };
    }
  } catch (err) {
    console.warn(`[Supabase] Network error during loadProfileData for ${profileId}:`, err);
    return { ...localData, isCloud: false };
  }
}

/**
 * Saves profile data to local storage and upserts into Supabase 'profiles' table.
 */
export async function saveProfileData(
  profileId: ProfileId,
  pokemons: Pokemon[],
  config: SnorlaxConfig
): Promise<{ success: boolean; cloudSynced: boolean }> {
  // 1. Synchronous local backup (0ms latency guarantee)
  saveProfileToLocal(profileId, pokemons, config);

  if (!supabase || !isSupabaseConfigured) {
    return { success: true, cloudSynced: false };
  }

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
      console.warn(`[Supabase] Error upserting profile "${profileId}":`, error.message);
      return { success: true, cloudSynced: false };
    }

    return { success: true, cloudSynced: true };
  } catch (err) {
    console.warn(`[Supabase] Network exception saving profile "${profileId}":`, err);
    return { success: true, cloudSynced: false };
  }
}

// Debounce manager for automatic background sync
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function cancelPendingSave(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

export function queueProfileSave(
  profileId: ProfileId,
  pokemons: Pokemon[],
  config: SnorlaxConfig,
  onStatusChange?: (status: SyncStatus) => void,
  delayMs: number = 1500
): void {
  // Save to local storage synchronously right away
  saveProfileToLocal(profileId, pokemons, config);

  if (!isSupabaseConfigured) {
    onStatusChange?.('local');
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  onStatusChange?.('syncing');

  debounceTimer = setTimeout(async () => {
    const result = await saveProfileData(profileId, pokemons, config);
    if (result.cloudSynced) {
      onStatusChange?.('synced');
    } else {
      onStatusChange?.('error');
    }
  }, delayMs);
}
