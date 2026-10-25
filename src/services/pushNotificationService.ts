import { Pokemon, PushNotificationConfig, PushSubscriptionRecord, SnorlaxConfig } from '../types/pokemon';
import { ProfileId, PROFILES } from './supabase';

// Project VAPID Public Key (matches server-side keypair; overridable via VITE_VAPID_PUBLIC_KEY)
const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;
export const PUBLIC_VAPID_KEY = (
  env.VITE_VAPID_PUBLIC_KEY ||
  'BMcGfc5mzT0xQSeA60i1sfFslbQX6As_KuikpHeC32lGG03EN-hTeuV9GJJihoXS-CtLeziMUTjRN2atw563jaQ'
).trim();

export function getDefaultPushConfig(): PushNotificationConfig {
  let detectedTz = 'America/Mexico_City';
  try {
    if (typeof Intl !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) detectedTz = tz;
    }
  } catch {
    // ignore
  }

  return {
    enabled: false,
    timezone: detectedTz,
    wakeUpTime: '07:30',
    breakfastReminder: true,
    breakfastTime: '11:35', // 25 min before 12:00 PM breakfast cutoff
    lunchReminder: true,
    lunchTime: '17:35',     // 25 min before 6:00 PM lunch cutoff
    dinnerSleepReminder: true,
    dinnerSleepTime: '22:30', // 10:30 PM reminder before 11:00 PM sleep
    smartBagAlert: true,
    lunarEventsAlert: true,
    mondayResetAlert: true,
    mondayResetTime: '08:30',
    subscriptions: [],
    sentAlertKeys: {}
  };
}

export function mergeWithDefaultPushConfig(partial?: Partial<PushNotificationConfig>): PushNotificationConfig {
  const base = getDefaultPushConfig();
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    subscriptions: Array.isArray(partial.subscriptions) ? partial.subscriptions : base.subscriptions,
    sentAlertKeys: partial.sentAlertKeys || {}
  };
}

// ============================================================================
// 1. SMART TEAM BAG-FILL CALCULATOR (INGREDIENT & SKILL BOTTLENECK DETECTOR)
// ============================================================================

export interface TeamBagBottleneck {
  pokemonId: string;
  pokemonName: string;
  specialty: 'Ingredientes' | 'Habilidades' | 'Todo';
  carryLimit: number;
  fillMinutes: number;
  formattedDuration: string;
  primaryOutputLabel: string;
  isUsingFallbackTeam: boolean;
}

export function formatDurationMinutes(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hrs <= 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Finds the fastest-filling Ingredient or Skill Pokémon in the user's active team.
 * Intentionally ignores 'Bayas' specialists because full inventory triggers Sneaky Snacking (beneficial for Berries!).
 */
export function computeFastestTeamBagFill(
  pokemons: Pokemon[],
  config: SnorlaxConfig
): { bottleneck: TeamBagBottleneck | null; allBerriesTeam: boolean } {
  if (!Array.isArray(pokemons) || pokemons.length === 0) {
    return { bottleneck: null, allBerriesTeam: false };
  }

  let activeTeam: Pokemon[] = [];
  let isUsingFallbackTeam = false;

  const savedIds = config.currentTeam?.pokemonIds || [];
  if (savedIds.length > 0) {
    const byId = new Map(pokemons.map((p) => [p.id, p]));
    activeTeam = savedIds.map((id) => byId.get(id)).filter(Boolean) as Pokemon[];
  }

  if (activeTeam.length === 0) {
    isUsingFallbackTeam = true;
    activeTeam = [...pokemons].sort((a, b) => (b.rp || 0) - (a.rp || 0)).slice(0, 5);
  }

  // Count unlocked 'Bonus ayuda' stacks across all 5 active team members (-5% help time each)
  let helpingBonusCount = 0;
  for (const member of activeTeam) {
    const hasHB = (member.subskills || []).some(
      (s) => (s.enabled || s.unlockLevel <= member.level) && s.name === 'Bonus ayuda'
    );
    if (hasHB) helpingBonusCount++;
  }

  // Filter ONLY Ingredient / Skill / All-around specialists (Berry mons want Sneaky Snacking!)
  const candidates = activeTeam.filter(
    (p) => p.specialty === 'Ingredientes' || p.specialty === 'Habilidades' || p.specialty === 'Todo'
  );

  if (candidates.length === 0) {
    return { bottleneck: null, allBerriesTeam: activeTeam.length > 0 };
  }

  const hasGoodCamp = Boolean(config.goodCampTicket);
  let fastest: TeamBagBottleneck | null = null;

  for (const mon of candidates) {
    const unlockedSubs = (mon.subskills || [])
      .filter((s) => s.enabled || s.unlockLevel <= mon.level)
      .map((s) => s.name);

    // 1. Carry limit (including Good Camp Ticket +20%)
    const baseCarry = mon.carryLimit && mon.carryLimit > 0 ? mon.carryLimit : 18;
    const effectiveCarry = hasGoodCamp ? Math.ceil(baseCarry * 1.2) : baseCarry;

    // 2. Subskill speed reduction (capped at 35% per official Pokémon Sleep formula)
    let subSpeedReduction = helpingBonusCount * 0.05;
    if (unlockedSubs.includes('Velocidad ayuda S')) subSpeedReduction += 0.07;
    if (unlockedSubs.includes('Velocidad ayuda M')) subSpeedReduction += 0.14;
    subSpeedReduction = Math.min(0.35, subSpeedReduction);

    // Base frequencySeconds already incorporates level & nature speedMod.
    // Daytime average energy (~75%) roughly halves help interval (~0.50x); Good Camp gives 1.2x speed.
    const rawFreq = mon.frequencySeconds && mon.frequencySeconds > 300 ? mon.frequencySeconds : 2600;
    let effectiveHelpSec = rawFreq * (1 - subSpeedReduction) * 0.50;
    if (hasGoodCamp) {
      effectiveHelpSec = effectiveHelpSec / 1.2;
    }

    // 3. Items dropped per help (berries vs unlocked ingredient drops)
    const hasBFS = unlockedSubs.includes('Busca bayas S');
    const berryDropCount = 1 + (hasBFS ? 1 : 0);

    let ingRate = mon.specialty === 'Ingredientes' ? 0.24 : 0.18;
    const natIngMod = mon.natureObj?.ingMod || 1.0;
    let ingSubMult = 1.0;
    if (unlockedSubs.includes('Más ingredientes S')) ingSubMult += 0.18;
    if (unlockedSubs.includes('Más ingredientes M')) ingSubMult += 0.36;
    ingRate = Math.min(0.65, ingRate * natIngMod * ingSubMult);

    const unlockedIngs = (mon.ingredients || []).filter(
      (ing) => ing.enabled || ing.unlockLevel <= mon.level
    );
    const avgIngDrop =
      unlockedIngs.length > 0
        ? unlockedIngs.reduce((sum, item) => sum + (item.count || 1), 0) / unlockedIngs.length
        : mon.specialty === 'Ingredientes'
        ? 2.2
        : 1.3;

    const avgItemsPerHelp = (1 - ingRate) * berryDropCount + ingRate * avgIngDrop;
    const helpsToFill = effectiveCarry / Math.max(1, avgItemsPerHelp);
    const rawMinutes = Math.round((helpsToFill * effectiveHelpSec) / 60);
    const fillMinutes = Math.max(45, Math.min(480, rawMinutes));

    const primaryIng = unlockedIngs[unlockedIngs.length - 1]?.name || mon.ingredients?.[0]?.name || 'ingredientes';
    const primaryOutputLabel =
      mon.specialty === 'Ingredientes'
        ? primaryIng
        : mon.mainSkillName
        ? `su habilidad (${mon.mainSkillName})`
        : 'sus recursos';

    if (!fastest || fillMinutes < fastest.fillMinutes) {
      fastest = {
        pokemonId: mon.id,
        pokemonName: mon.name,
        specialty: mon.specialty as 'Ingredientes' | 'Habilidades' | 'Todo',
        carryLimit: effectiveCarry,
        fillMinutes,
        formattedDuration: formatDurationMinutes(fillMinutes),
        primaryOutputLabel,
        isUsingFallbackTeam
      };
    }
  }

  return { bottleneck: fastest, allBerriesTeam: false };
}

// ============================================================================
// 2. ASTRONOMICAL LUNAR PHASE ENGINE (NEW MOON 🌑 & FULL MOON 🌕)
// ============================================================================

const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0); // Reference New Moon: Jan 6, 2000 18:14 UTC

export interface LunarEventStatus {
  phaseDays: number;
  illuminationPct: number;
  activeEvent: 'new_moon' | 'full_moon' | null;
  eventStage: 'eve' | 'peak' | 'after' | null;
  emoji: string;
  label: string;
  bonusSummary: string | null;
  daysUntilNewMoon: number;
  daysUntilFullMoon: number;
}

export function getLunarEventStatus(date: Date = new Date()): LunarEventStatus {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON_MS) / 86400000;
  const phaseDays = ((diffDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const halfCycle = SYNODIC_MONTH_DAYS / 2; // ~14.765 days

  // Approximate % illumination
  const illuminationPct = Math.round(((1 - Math.cos((2 * Math.PI * phaseDays) / SYNODIC_MONTH_DAYS)) / 2) * 100);

  let activeEvent: 'new_moon' | 'full_moon' | null = null;
  let eventStage: 'eve' | 'peak' | 'after' | null = null;
  let emoji = '🌙';
  let label = 'Fase lunar regular';
  let bonusSummary: string | null = null;

  // 1. Check 3-night New Moon window (Día de Luna Nueva)
  if (phaseDays >= SYNODIC_MONTH_DAYS - 1.5 && phaseDays < SYNODIC_MONTH_DAYS - 0.5) {
    activeEvent = 'new_moon';
    eventStage = 'eve';
    emoji = '🌑';
    label = 'Víspera de Luna Nueva';
    bonusSummary = '¡1ª noche de Luna Nueva! Los Pokémon tardan más en llenarse con galletas y sube la probabilidad Shiny ✨ / Darkrai.';
  } else if (phaseDays >= SYNODIC_MONTH_DAYS - 0.5 || phaseDays < 0.5) {
    activeEvent = 'new_moon';
    eventStage = 'peak';
    emoji = '🌑';
    label = '¡Noche Central de Luna Nueva!';
    bonusSummary = '¡Pico de Luna Nueva! Máximo bono contra saciedad de Pokégalletas + mayor probabilidad de Variocolor ✨ y Darkrai.';
  } else if (phaseDays >= 0.5 && phaseDays < 1.5) {
    activeEvent = 'new_moon';
    eventStage = 'after';
    emoji = '🌑';
    label = 'Última noche de Luna Nueva';
    bonusSummary = '¡3ª noche de Luna Nueva! Aprovecha el bono de Pokégalletas y probabilidad Shiny ✨ antes de que termine.';
  }
  // 2. Check 3-night Full Moon window (Día de los Dormilones / Good Sleep Day)
  else if (phaseDays >= halfCycle - 1.5 && phaseDays < halfCycle - 0.5) {
    activeEvent = 'full_moon';
    eventStage = 'eve';
    emoji = '🌕';
    label = 'Víspera de Luna Llena';
    bonusSummary = '¡1ª noche del Día de los Dormilones! Poder Drowsy ×1.5 y EXP de sueño extra. Prepara inciensos.';
  } else if (phaseDays >= halfCycle - 0.5 && phaseDays < halfCycle + 0.5) {
    activeEvent = 'full_moon';
    eventStage = 'peak';
    emoji = '🌕';
    label = '¡Noche de Luna Llena!';
    bonusSummary = '¡Pico del Día de los Dormilones! Poder Drowsy ×2.0+ y EXP multiplicada — usa Incienso Crecimiento o Suerte.';
  } else if (phaseDays >= halfCycle + 0.5 && phaseDays < halfCycle + 1.5) {
    activeEvent = 'full_moon';
    eventStage = 'after';
    emoji = '🌕';
    label = 'Última noche de Luna Llena';
    bonusSummary = '¡Cierre del Día de los Dormilones! Poder Drowsy ×1.5 esta noche al dormir a las 11.';
  } else {
    if (phaseDays < halfCycle) {
      emoji = phaseDays < 7.4 ? '🌒' : '🌔';
      label = phaseDays < 7.4 ? 'Luna Creciente' : 'Gibosa Creciente';
    } else {
      emoji = phaseDays < 22.1 ? '🌖' : '🌘';
      label = phaseDays < 22.1 ? 'Gibosa Menguante' : 'Luna Menguante';
    }
  }

  const daysUntilNewMoon =
    activeEvent === 'new_moon'
      ? 0
      : Math.max(1, Math.round(SYNODIC_MONTH_DAYS - phaseDays));

  const rawToFull = halfCycle - phaseDays;
  const daysUntilFullMoon =
    activeEvent === 'full_moon'
      ? 0
      : Math.max(1, Math.round(rawToFull > 0 ? rawToFull : SYNODIC_MONTH_DAYS + rawToFull));

  return {
    phaseDays,
    illuminationPct,
    activeEvent,
    eventStage,
    emoji,
    label,
    bonusSummary,
    daysUntilNewMoon,
    daysUntilFullMoon
  };
}

// ============================================================================
// 3. PLATFORM DETECTION & BROWSER WEB PUSH SUBSCRIPTION MANAGEMENT
// ============================================================================

export interface PushPlatformSupport {
  platform: 'android' | 'ios' | 'desktop';
  isStandalonePwa: boolean;
  supportsPush: boolean;
  supportsActionButtons: boolean;
  needsIosHomeScreenInstall: boolean;
  permissionState: NotificationPermission | 'unsupported';
}

export function detectPushPlatformSupport(): PushPlatformSupport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      platform: 'desktop',
      isStandalonePwa: false,
      supportsPush: false,
      supportsActionButtons: false,
      needsIosHomeScreenInstall: false,
      permissionState: 'unsupported'
    };
  }

  const ua = navigator.userAgent || '';
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const platform: 'android' | 'ios' | 'desktop' = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

  const isStandalonePwa =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as any).standalone);

  const hasWebPushApis =
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const needsIosHomeScreenInstall = isIOS && !isStandalonePwa;
  const supportsPush = hasWebPushApis && !needsIosHomeScreenInstall;

  // Android Chrome & Desktop browsers support lock-screen action buttons; iOS Safari ignores `actions`
  const supportsActionButtons = !isIOS && supportsPush;

  const permissionState: NotificationPermission | 'unsupported' =
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  return {
    platform,
    isStandalonePwa,
    supportsPush,
    supportsActionButtons,
    needsIosHomeScreenInstall,
    permissionState
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getActiveBrowserPushEndpoint(): Promise<string | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;
    const sub = await reg.pushManager.getSubscription();
    return sub ? sub.endpoint : null;
  } catch {
    return null;
  }
}

export async function subscribeDeviceToWebPush(
  currentPushConfig?: PushNotificationConfig
): Promise<{ updatedConfig: PushNotificationConfig; subscription: PushSubscriptionRecord }> {
  const support = detectPushPlatformSupport();
  if (support.needsIosHomeScreenInstall) {
    throw new Error(
      'En iPhone/iPad primero agrega la app a tu Pantalla de Inicio (Compartir → Agregar a inicio) para habilitar notificaciones Push.'
    );
  }
  if (!support.supportsPush) {
    throw new Error('Tu navegador actual no soporta Web Push. Usa Chrome en Android o instala la PWA.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      'Permiso de notificaciones denegado. Actívalo en los ajustes del navegador / sistema para recibir alertas.'
    );
  }

  // Ensure Service Worker is registered (in dev or production)
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js');
  }
  await navigator.serviceWorker.ready;

  let pushSub = await registration.pushManager.getSubscription();
  if (!pushSub) {
    const appServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
    pushSub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey as unknown as BufferSource
    });
  }

  const subJson = pushSub.toJSON();
  if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
    throw new Error('No se pudieron generar las llaves criptográficas de suscripción Push.');
  }

  const deviceLabel =
    support.platform === 'android'
      ? 'Celular Android'
      : support.platform === 'ios'
      ? 'iPhone / iOS PWA'
      : 'Navegador Escritorio';

  const record: PushSubscriptionRecord = {
    endpoint: subJson.endpoint,
    keys: {
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth
    },
    deviceLabel,
    platform: support.platform,
    createdAt: new Date().toISOString()
  };

  const merged = mergeWithDefaultPushConfig(currentPushConfig);
  const filteredSubs = merged.subscriptions.filter((s) => s.endpoint !== record.endpoint);

  const updatedConfig: PushNotificationConfig = {
    ...merged,
    enabled: true,
    appOrigin: window.location.origin,
    lastBagCollectedAt: merged.lastBagCollectedAt || new Date().toISOString(),
    subscriptions: [...filteredSubs, record]
  };

  return { updatedConfig, subscription: record };
}

export async function unsubscribeDeviceFromWebPush(
  currentPushConfig?: PushNotificationConfig
): Promise<PushNotificationConfig> {
  const merged = mergeWithDefaultPushConfig(currentPushConfig);
  let removedEndpoint: string | null = null;

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        removedEndpoint = sub.endpoint;
        await sub.unsubscribe();
      }
    } catch (err) {
      console.warn('Error unsubscribing push endpoint:', err);
    }
  }

  const remaining = removedEndpoint
    ? merged.subscriptions.filter((s) => s.endpoint !== removedEndpoint)
    : [];

  return {
    ...merged,
    enabled: remaining.length > 0,
    subscriptions: remaining
  };
}

/**
 * Triggers an immediate real VAPID Web Push test to the current device (with local SW fallback).
 */
export async function triggerTestPushNotification(params: {
  profileId: ProfileId;
  pushConfig: PushNotificationConfig;
  bottleneck: TeamBagBottleneck | null;
}): Promise<{ viaServer: boolean }> {
  const { profileId, pushConfig, bottleneck } = params;
  const activeEndpoint = await getActiveBrowserPushEndpoint();
  const targetSub =
    pushConfig.subscriptions.find((s) => s.endpoint === activeEndpoint) ||
    pushConfig.subscriptions[pushConfig.subscriptions.length - 1];

  const lunar = getLunarEventStatus();
  const title = bottleneck
    ? `🎒 Prueba: ¡${bottleneck.pokemonName} llenó su bolsa!`
    : `💤 ¡Notificaciones listas, ${PROFILES[profileId].name}!`;
  const body = bottleneck
    ? `Bolsa (${bottleneck.carryLimit}/${bottleneck.carryLimit}) en ~${bottleneck.formattedDuration} · Prueba tocar "✅ Ya recogí" desde aquí. (${lunar.emoji} ${lunar.label})`
    : `Recibirás avisos 25 min antes de cerrar Desayuno/Comida, Cena 10:30 PM y eventos lunares (${lunar.emoji} ${lunar.label}).`;

  if (targetSub) {
    try {
      const resp = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          profileId,
          subscription: targetSub,
          payload: {
            title,
            body,
            tag: `pokesleep-test-${Date.now()}`,
            url: '/?push_action=bag-collected',
            profileId,
            alertType: 'bag',
            actions: [
              { action: 'bag-collected', title: '✅ Ya recogí' },
              { action: 'snooze-1h', title: '⏱️ +1 hora' }
            ]
          }
        })
      });
      if (resp.ok) {
        return { viaServer: true };
      }
    } catch {
      // Fallback to local Service Worker notification below
    }
  }

  // Local Service Worker fallback (e.g. local preview)
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && Notification.permission === 'granted') {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/favicon.png',
      tag: `pokesleep-local-test-${Date.now()}`,
      data: { url: '/?push_action=bag-collected', profileId, alertType: 'bag' },
      actions: [
        { action: 'bag-collected', title: '✅ Ya recogí' },
        { action: 'snooze-1h', title: '⏱️ +1 hora' }
      ]
    } as any);
    return { viaServer: false };
  }

  throw new Error('Activa primero las notificaciones en este dispositivo para enviar una prueba.');
}

/**
 * Sends an instant friendly push reminder to the other profile ('cris' <-> 'ady').
 */
export async function sendPartnerQuickNudge(
  fromProfile: ProfileId,
  kind: 'meal' | 'sleep'
): Promise<{ sentCount: number }> {
  const toProfile: ProfileId = fromProfile === 'cris' ? 'ady' : 'cris';
  const resp = await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'nudge',
      fromProfile,
      toProfile,
      kind
    })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.message || `El perfil de ${PROFILES[toProfile].name} aún no tiene notificaciones activas.`);
  }
  return { sentCount: data.sentCount || 1 };
}
