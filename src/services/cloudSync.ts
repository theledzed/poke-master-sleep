/**
 * Legacy compatibility bridge for cloudSync.ts -> supabase.ts
 */
export * from './supabase';
export {
  loadProfileData as fetchProfileFromCloud,
  saveProfileData as pushProfileToCloud,
  queueProfileSave as queueCloudSync,
  cancelPendingSave as cancelPendingCloudSync,
  getProfileFromLocal as loadProfileFromLocal,
  isSupabaseConfigured as isCloudSyncConfigured
} from './supabase';
