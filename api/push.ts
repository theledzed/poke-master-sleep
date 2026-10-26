// Vercel Serverless Function: GET / POST /api/push
// Unified Web Push Engine: Cron Dispatch, Lock-Screen Action ACK, Instant Test & Partner Nudge

import * as webpushModule from 'web-push';
const webpush: typeof import('web-push') = (webpushModule as any).default || webpushModule;
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY = (
  process.env.VAPID_PUBLIC_KEY ||
  process.env.VITE_VAPID_PUBLIC_KEY ||
  'BMcGfc5mzT0xQSeA60i1sfFslbQX6As_KuikpHeC32lGG03EN-hTeuV9GJJihoXS-CtLeziMUTjRN2atw563jaQ'
).trim();

const VAPID_PRIVATE_KEY = (
  process.env.VAPID_PRIVATE_KEY ||
  'fU4k7Qi_31fVpFiGb2hKN01Lrqyxq5DrwPsYp9YrEqE'
).trim();

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:sleepmaster@pokesleep.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function getSupabaseClient() {
  const url = (
    process.env.VITE_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim();

  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  if (!url || !key) return null;
  return createClient(url, key);
}

// ============================================================================
// TIMEZONE & LUNAR ASTRONOMY HELPERS
// ============================================================================

interface LocalClock {
  dateKey: string;      // YYYY-MM-DD in user's timezone
  weekday: number;      // 0 = Sun, 1 = Mon ... 6 = Sat
  hour: number;
  minute: number;
  minutesOfDay: number;
}

function getLocalClock(now: Date, timeZone: string): LocalClock {
  const tz = timeZone || 'America/Mexico_City';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(now);

    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const hour = Number(map.hour === '24' ? 0 : map.hour || 0);
    const minute = Number(map.minute || 0);
    const wdMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
    };
    const weekday = wdMap[map.weekday] ?? now.getUTCDay();
    const dateKey = `${map.year}-${map.month}-${map.day}`;

    return {
      dateKey,
      weekday,
      hour,
      minute,
      minutesOfDay: hour * 60 + minute
    };
  } catch {
    // Fallback to UTC-6 (Mexico City standard time)
    const mex = new Date(now.getTime() - 6 * 3600 * 1000);
    const yyyy = mex.getUTCFullYear();
    const mm = String(mex.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(mex.getUTCDate()).padStart(2, '0');
    const hour = mex.getUTCHours();
    const minute = mex.getUTCMinutes();
    return {
      dateKey: `${yyyy}-${mm}-${dd}`,
      weekday: mex.getUTCDay(),
      hour,
      minute,
      minutesOfDay: hour * 60 + minute
    };
  }
}

function parseHHMM(hhmm: string | undefined, fallbackMinutes: number): number {
  if (!hhmm || !hhmm.includes(':')) return fallbackMinutes;
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return fallbackMinutes;
  return h * 60 + m;
}

function isInWindow(currentMins: number, targetMins: number, windowLen = 20): boolean {
  const diff = currentMins - targetMins;
  return diff >= 0 && diff <= windowLen;
}

const SYNODIC_MONTH = 29.530588853;
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

function getServerLunarEvent(now: Date): { emoji: string; label: string; bonusSummary: string } | null {
  const diffDays = (now.getTime() - REF_NEW_MOON_MS) / 86400000;
  const phase = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const half = SYNODIC_MONTH / 2;

  if (phase >= SYNODIC_MONTH - 1.5 || phase < 1.5) {
    const isPeak = phase >= SYNODIC_MONTH - 0.5 || phase < 0.5;
    return {
      emoji: '🌑',
      label: isPeak ? 'Noche Central de Luna Nueva' : 'Evento de Luna Nueva',
      bonusSummary: 'Los Pokémon tardan más en llenarse con Pokégalletas + sube probabilidad Shiny ✨ y Darkrai.'
    };
  }

  if (phase >= half - 1.5 && phase < half + 1.5) {
    const isPeak = phase >= half - 0.5 && phase < half + 0.5;
    return {
      emoji: '🌕',
      label: isPeak ? 'Noche de Luna Llena' : 'Día de los Dormilones',
      bonusSummary: isPeak
        ? 'Poder Drowsy ×2.0+ y EXP multiplicada — ¡no olvides poner Incienso!'
        : 'Poder Drowsy ×1.5 esta noche — ¡buen momento para usar Inciensos!'
    };
  }

  return null;
}

// ============================================================================
// SERVER-SIDE TEAM BAG-FILL CALCULATOR
// ============================================================================

function computeFastestBagServer(pokemons: any[], config: any) {
  if (!Array.isArray(pokemons) || pokemons.length === 0) return null;

  const savedIds: string[] = config?.currentTeam?.pokemonIds || [];
  let activeTeam: any[] = [];
  if (savedIds.length > 0) {
    const byId = new Map(pokemons.map((p: any) => [p.id, p]));
    activeTeam = savedIds.map((id) => byId.get(id)).filter(Boolean);
  }
  if (activeTeam.length === 0) {
    activeTeam = [...pokemons].sort((a, b) => (b.rp || 0) - (a.rp || 0)).slice(0, 5);
  }

  let helpingBonusCount = 0;
  for (const m of activeTeam) {
    const hasHB = (m.subskills || []).some(
      (s: any) => (s.enabled || s.unlockLevel <= m.level) && s.name === 'Bonus ayuda'
    );
    if (hasHB) helpingBonusCount++;
  }

  // Only watch Ingredient / Skill / All specialists (Berry specialists want Sneaky Snacking)
  const candidates = activeTeam.filter(
    (p: any) => p.specialty === 'Ingredientes' || p.specialty === 'Habilidades' || p.specialty === 'Todo'
  );
  if (candidates.length === 0) return null;

  const hasGoodCamp = Boolean(config?.goodCampTicket);
  let fastest: {
    pokemonName: string;
    carryLimit: number;
    fillMinutes: number;
    formattedDuration: string;
    primaryOutputLabel: string;
  } | null = null;

  for (const mon of candidates) {
    const unlockedSubs = (mon.subskills || [])
      .filter((s: any) => s.enabled || s.unlockLevel <= mon.level)
      .map((s: any) => s.name);

    const baseCarry = mon.carryLimit && mon.carryLimit > 0 ? mon.carryLimit : 18;
    const effectiveCarry = hasGoodCamp ? Math.ceil(baseCarry * 1.2) : baseCarry;

    let subSpeedRed = helpingBonusCount * 0.05;
    if (unlockedSubs.includes('Velocidad ayuda S')) subSpeedRed += 0.07;
    if (unlockedSubs.includes('Velocidad ayuda M')) subSpeedRed += 0.14;
    subSpeedRed = Math.min(0.35, subSpeedRed);

    const rawFreq = mon.frequencySeconds && mon.frequencySeconds > 300 ? mon.frequencySeconds : 2600;
    let effectiveHelpSec = rawFreq * (1 - subSpeedRed) * 0.50;
    if (hasGoodCamp) effectiveHelpSec /= 1.2;

    const hasBFS = unlockedSubs.includes('Busca bayas S');
    const berryDropCount = 1 + (hasBFS ? 1 : 0);

    let ingRate = mon.specialty === 'Ingredientes' ? 0.24 : 0.18;
    const natIngMod = mon.natureObj?.ingMod || 1.0;
    let ingSubMult = 1.0;
    if (unlockedSubs.includes('Más ingredientes S')) ingSubMult += 0.18;
    if (unlockedSubs.includes('Más ingredientes M')) ingSubMult += 0.36;
    ingRate = Math.min(0.65, ingRate * natIngMod * ingSubMult);

    const unlockedIngs = (mon.ingredients || []).filter(
      (ing: any) => ing.enabled || ing.unlockLevel <= mon.level
    );
    const avgIngDrop =
      unlockedIngs.length > 0
        ? unlockedIngs.reduce((sum: number, it: any) => sum + (it.count || 1), 0) / unlockedIngs.length
        : mon.specialty === 'Ingredientes'
        ? 2.2
        : 1.3;

    const avgItemsPerHelp = (1 - ingRate) * berryDropCount + ingRate * avgIngDrop;
    const helpsToFill = effectiveCarry / Math.max(1, avgItemsPerHelp);
    const fillMinutes = Math.max(45, Math.min(480, Math.round((helpsToFill * effectiveHelpSec) / 60)));

    const hrs = Math.floor(fillMinutes / 60);
    const mins = Math.round(fillMinutes % 60);
    const formattedDuration = hrs <= 0 ? `${mins}m` : mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;

    const primaryIng = unlockedIngs[unlockedIngs.length - 1]?.name || mon.ingredients?.[0]?.name || 'ingredientes';
    const primaryOutputLabel =
      mon.specialty === 'Ingredientes'
        ? primaryIng
        : mon.mainSkillName
        ? `su habilidad (${mon.mainSkillName})`
        : 'sus recursos';

    if (!fastest || fillMinutes < fastest.fillMinutes) {
      fastest = {
        pokemonName: mon.name,
        carryLimit: effectiveCarry,
        fillMinutes,
        formattedDuration,
        primaryOutputLabel
      };
    }
  }

  return fastest;
}

async function broadcastToSubscriptions(
  subscriptions: any[],
  payloadObj: Record<string, any>
): Promise<{ sentCount: number; validSubscriptions: any[] }> {
  const payloadStr = JSON.stringify(payloadObj);
  const validSubscriptions: any[] = [];
  let sentCount = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return;
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          payloadStr,
          { TTL: 3600 }
        );
        validSubscriptions.push(sub);
        sentCount++;
      } catch (err: any) {
        const status = err?.statusCode;
        // 404 or 410 means browser permanently unsubscribed -> drop stale endpoint
        if (status !== 404 && status !== 410) {
          validSubscriptions.push(sub);
        }
      }
    })
  );

  return { sentCount, validSubscriptions };
}

// ============================================================================
// MAIN SERVERLESS HANDLER
// ============================================================================

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = req.method === 'POST' ? req.body || {} : {};
  const action = req.method === 'GET' ? (req.query?.action || 'dispatch') : (body.action || 'dispatch');

  // 1. Public VAPID Key query
  if (action === 'vapid') {
    return res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
  }

  // 2. Instant Test Push to a single device subscription
  if (action === 'test') {
    const { subscription, payload } = body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ error: 'Falta el objeto subscription.' });
    }
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        },
        JSON.stringify(payload || { title: '💤 Prueba Pokémon Sleep Master', body: '¡Push activo!' }),
        { TTL: 300 }
      );
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(502).json({
        error: 'PUSH_SEND_FAILED',
        message: err?.message || 'No se pudo entregar la notificación de prueba.'
      });
    }
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase no está configurado en las variables del servidor.'
    });
  }

  // 3. Background ACK from Android Lock-Screen Button ("[✅ Ya recogí]" or "[⏱️ +1 hora]") or iOS 1-Tap
  if (action === 'ack') {
    const profileId = body.profileId === 'ady' ? 'ady' : 'cris';
    const ackType = body.ackType || 'bag-collected';

    const { data: row, error } = await supabase
      .from('profiles')
      .select('snorlax_config')
      .eq('id', profileId)
      .maybeSingle();

    if (error || !row) {
      return res.status(404).json({ error: 'Perfil no encontrado.' });
    }

    const cfg = row.snorlax_config || {};
    const pushCfg = cfg.pushConfig || {};
    const nowIso = new Date().toISOString();

    if (ackType === 'snooze-1h') {
      pushCfg.snoozedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    } else {
      pushCfg.lastBagCollectedAt = nowIso;
      delete pushCfg.snoozedUntil;
    }

    const updatedConfig = { ...cfg, pushConfig: pushCfg };
    await supabase
      .from('profiles')
      .update({ snorlax_config: updatedConfig, updated_at: nowIso })
      .eq('id', profileId);

    return res.status(200).json({ success: true, profileId, ackType, timestamp: nowIso });
  }

  // 4. Partner Quick Nudge ('cris' <-> 'ady')
  if (action === 'nudge') {
    const fromProfile = body.fromProfile === 'ady' ? 'ady' : 'cris';
    const toProfile = body.toProfile === 'cris' ? 'cris' : 'ady';
    const kind = body.kind === 'sleep' ? 'sleep' : 'meal';
    const fromName = fromProfile === 'cris' ? 'Cris 👦🏻' : 'Ady 👩🏻';
    const toName = toProfile === 'cris' ? 'Cris' : 'Ady';

    const { data: targetRow } = await supabase
      .from('profiles')
      .select('snorlax_config')
      .eq('id', toProfile)
      .maybeSingle();

    const targetSubs: any[] = targetRow?.snorlax_config?.pushConfig?.subscriptions || [];
    if (targetSubs.length === 0) {
      return res.status(404).json({
        error: 'NO_SUBSCRIPTIONS',
        message: `${toName} aún no ha activado las notificaciones Push en su celular.`
      });
    }

    const payload =
      kind === 'meal'
        ? {
            title: `🍽️ ¡${fromName} te avisa!`,
            body: `¡Dale de comer a Snorlax antes de que se pase la hora! 🍲`,
            icon: '/images/berries/oran.png',
            tag: `pokesleep-nudge-${Date.now()}`,
            url: '/?tab=recipes',
            profileId: toProfile,
            alertType: 'meal',
            vibrate: [100, 50, 100, 50, 200],
            actions: [{ action: 'open-chef', title: '🍳 Chef IA' }]
          }
        : {
            title: `🌙 ¡${fromName} te recuerda!`,
            body: `¡Hora de dormir a Snorlax y revisar tus inciensos! 💤`,
            icon: '/images/berries/leppa.png',
            tag: `pokesleep-nudge-${Date.now()}`,
            url: '/?tab=optimizer',
            profileId: toProfile,
            alertType: 'sleep',
            vibrate: [150, 80, 250],
            actions: [{ action: 'open-camp', title: '⛺ Campamento' }]
          };

    const { sentCount, validSubscriptions } = await broadcastToSubscriptions(targetSubs, payload);
    if (validSubscriptions.length !== targetSubs.length && targetRow?.snorlax_config) {
      const nextCfg = {
        ...targetRow.snorlax_config,
        pushConfig: {
          ...targetRow.snorlax_config.pushConfig,
          subscriptions: validSubscriptions
        }
      };
      await supabase.from('profiles').update({ snorlax_config: nextCfg }).eq('id', toProfile);
    }

    return res.status(200).json({ success: true, sentCount });
  }

  // 5. Scheduled Cron Dispatch (evaluates all active profiles idempotently)
  try {
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('id, pokemons, snorlax_config');

    if (error || !Array.isArray(rows)) {
      return res.status(500).json({ error: error?.message || 'Error consultando perfiles.' });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const summary: Array<{ profileId: string; sent: string[] }> = [];

    for (const row of rows) {
      const profileId = row.id;
      const cfg = row.snorlax_config || {};
      const pushCfg = cfg.pushConfig;

      if (!pushCfg?.enabled || !Array.isArray(pushCfg.subscriptions) || pushCfg.subscriptions.length === 0) {
        continue;
      }

      const clock = getLocalClock(now, pushCfg.timezone || 'America/Mexico_City');
      const isSunday = clock.weekday === 0;
      const isMonday = clock.weekday === 1;

      const sentAlertKeys: Record<string, string> = { ...(pushCfg.sentAlertKeys || {}) };
      // Prune keys older than 72 hours
      const cutoffMs = now.getTime() - 72 * 3600 * 1000;
      for (const [k, ts] of Object.entries(sentAlertKeys)) {
        if (Date.parse(ts) < cutoffMs) {
          delete sentAlertKeys[k];
        }
      }

      let currentSubs = [...pushCfg.subscriptions];
      let configDirty = false;
      const dispatchedTags: string[] = [];

      const queueNotification = async (alertKey: string, payloadObj: Record<string, any>) => {
        if (sentAlertKeys[alertKey] || currentSubs.length === 0) return;
        const { sentCount, validSubscriptions } = await broadcastToSubscriptions(currentSubs, payloadObj);
        if (validSubscriptions.length !== currentSubs.length) {
          currentSubs = validSubscriptions;
          configDirty = true;
        }
        if (sentCount > 0) {
          sentAlertKeys[alertKey] = nowIso;
          dispatchedTags.push(alertKey);
          configDirty = true;
        }
      };

      // A. Monday Morning Island & Berry Setup Ritual (default 08:30)
      if (isMonday && pushCfg.mondayResetAlert !== false) {
        const mondayTarget = parseHHMM(pushCfg.mondayResetTime, 8 * 60 + 30);
        if (isInWindow(clock.minutesOfDay, mondayTarget, 22)) {
          await queueNotification(`${clock.dateKey}:monday-reset`, {
            title: '🏝️ ¡Lunes: Nueva Isla!',
            body: 'Elige tu isla y bayas de Snorlax\npara optimizar tu equipo semanal.',
            icon: '/pwa-192x192.png',
            tag: `pokesleep-monday-${profileId}`,
            url: '/?tab=optimizer',
            profileId,
            alertType: 'monday',
            vibrate: [150, 100, 200],
            actions: [{ action: 'open-camp', title: '⛺ Campamento' }]
          });
        }
      }

      // B. Breakfast Last Call — 25 min before 12:00 PM (default 11:35)
      if (pushCfg.breakfastReminder !== false) {
        const bTarget = parseHHMM(pushCfg.breakfastTime, 11 * 60 + 35);
        if (isInWindow(clock.minutesOfDay, bTarget, 20)) {
          await queueNotification(`${clock.dateKey}:breakfast`, {
            title: isSunday
              ? '🔥 ¡Súper Olla! 25m para Desayuno'
              : '🥐 Snorlax: Desayuno (25 min)',
            body: isSunday
              ? 'Olla ×2 y +20% crítico antes de 12:00 PM\n¡Toca para escanear en Chef IA!'
              : 'Cierra a las 12:00 PM\n¡Toca para armar tu plato en Chef IA!',
            icon: '/images/berries/oran.png',
            tag: `pokesleep-meal-${profileId}`,
            url: '/?tab=recipes',
            profileId,
            alertType: 'meal',
            vibrate: [120, 80, 120, 80, 240],
            actions: [{ action: 'open-chef', title: '🍳 Chef IA' }]
          });
        }
      }

      // C. Lunch Last Call — 25 min before 6:00 PM (default 17:35)
      if (pushCfg.lunchReminder !== false) {
        const lTarget = parseHHMM(pushCfg.lunchTime, 17 * 60 + 35);
        if (isInWindow(clock.minutesOfDay, lTarget, 20)) {
          await queueNotification(`${clock.dateKey}:lunch`, {
            title: isSunday
              ? '🔥 ¡Súper Olla! 25m para Comida'
              : '🍲 Snorlax: Comida (25 min)',
            body: isSunday
              ? 'Súper Olla dominical antes de 6:00 PM\n¡Dispara tu rango semanal!'
              : 'Cierra a las 6:00 PM (cambio a Cena)\n¡No pierdas el vigor de la tarde!',
            icon: '/images/berries/oran.png',
            tag: `pokesleep-meal-${profileId}`,
            url: '/?tab=recipes',
            profileId,
            alertType: 'meal',
            vibrate: [120, 80, 120, 80, 240],
            actions: [{ action: 'open-chef', title: '🍳 Chef IA' }]
          });
        }
      }

      // D. Dinner + Pre-Sleep (default 22:30 -> 30 min before 11:00 PM bedtime) + Astronomical Moon Events!
      const dinnerSleepTarget = parseHHMM(pushCfg.dinnerSleepTime, 22 * 60 + 30);
      if (pushCfg.dinnerSleepReminder !== false && isInWindow(clock.minutesOfDay, dinnerSleepTarget, 22)) {
        const lunar = pushCfg.lunarEventsAlert !== false ? getServerLunarEvent(now) : null;
        const title = lunar
          ? `${lunar.emoji} ¡${lunar.label} + Cena!`
          : isSunday
          ? '🌙 Súper Cena de Domingo'
          : '🌙 Snorlax: Hora de la Cena';
        const body = lunar
          ? `Cena y prepara el sueño (~23:00)\n${lunar.bonusSummary}`
          : 'Cena antes de dormirlo (~23:00)\nRevisa tu equipo e inciensos.';

        const lunarImg = lunar?.activeEvent === 'new_moon'
          ? '/images/pokemon/darkrai.png'
          : lunar?.activeEvent === 'full_moon'
          ? '/images/pokemon/cresselia.png'
          : undefined;

        await queueNotification(`${clock.dateKey}:dinner-sleep`, {
          title,
          body,
          icon: lunarImg || '/images/berries/leppa.png',
          image: lunarImg,
          tag: `pokesleep-night-${profileId}`,
          url: '/?tab=recipes',
          profileId,
          alertType: 'sleep',
          vibrate: [180, 100, 280],
          actions: [{ action: 'open-chef', title: '🍳 Cena Chef' }]
        });
      }

      // E. Smart Team Bag-Fill Alert (watches fastest Ingredient/Skill Pokémon in currentTeam)
      const wakeUpMins = parseHHMM(pushCfg.wakeUpTime, 7 * 60 + 30);
      const isAwakeHours =
        clock.minutesOfDay >= wakeUpMins + 30 && clock.minutesOfDay <= dinnerSleepTarget - 15;

      if (pushCfg.smartBagAlert !== false && isAwakeHours) {
        const snoozedUntilMs = pushCfg.snoozedUntil ? Date.parse(pushCfg.snoozedUntil) : 0;
        if (!snoozedUntilMs || now.getTime() >= snoozedUntilMs) {
          const fastest = computeFastestBagServer(row.pokemons || [], cfg);
          if (fastest) {
            // Compute latest natural collection anchor in minutes-of-day:
            // Wake-up (e.g. 07:30), Noon post-breakfast (12:00), or 6 PM post-lunch (18:00)
            let naturalAnchorMins = wakeUpMins;
            if (clock.minutesOfDay >= 18 * 60) {
              naturalAnchorMins = 18 * 60;
            } else if (clock.minutesOfDay >= 12 * 60) {
              naturalAnchorMins = 12 * 60;
            }

            // Convert naturalAnchorMins to approximate epoch timestamp
            const minsSinceNaturalAnchor = clock.minutesOfDay - naturalAnchorMins;
            const naturalAnchorMs = now.getTime() - minsSinceNaturalAnchor * 60 * 1000;

            const manualCollectedMs = pushCfg.lastBagCollectedAt
              ? Date.parse(pushCfg.lastBagCollectedAt)
              : 0;

            const effectiveAnchorMs = Math.max(naturalAnchorMs, manualCollectedMs || 0);
            const elapsedMinutes = (now.getTime() - effectiveAnchorMs) / 60000;

            // Round anchor bucket to 5-minute resolution so small clock drift keeps the exact same idempotency key
            const anchorBucket = Math.round(effectiveAnchorMs / (5 * 60 * 1000));
            const bagAlertKey = `bag:${clock.dateKey}:${anchorBucket}`;

            if (elapsedMinutes >= fastest.fillMinutes && elapsedMinutes <= fastest.fillMinutes + 90) {
              const monClean = (fastest.pokemonName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              await queueNotification(bagAlertKey, {
                title: `🎒 ${fastest.pokemonName}: Bolsa llena`,
                body: `Límite ${fastest.carryLimit}/${fastest.carryLimit} (~${fastest.formattedDuration})\nEntra por ${fastest.primaryOutputLabel}`,
                icon: `/images/avatar/portrait/${monClean}.png`,
                image: `/images/pokemon/${monClean}.png`,
                tag: `pokesleep-bag-${profileId}`,
                url: '/?push_action=bag-collected',
                profileId,
                alertType: 'bag',
                vibrate: [90, 70, 90],
                actions: [
                  { action: 'bag-collected', title: '✅ Recogí' },
                  { action: 'snooze-1h', title: '⏱️ +1h' }
                ]
              });
            }
          }
        }
      }

      if (configDirty) {
        const nextConfig = {
          ...cfg,
          pushConfig: {
            ...pushCfg,
            subscriptions: currentSubs,
            sentAlertKeys
          }
        };
        await supabase
          .from('profiles')
          .update({ snorlax_config: nextConfig, updated_at: nowIso })
          .eq('id', profileId);
      }

      summary.push({ profileId, sent: dispatchedTags });
    }

    return res.status(200).json({
      success: true,
      checkedAt: nowIso,
      summary
    });
  } catch (err: any) {
    console.error('Push dispatch error:', err);
    return res.status(500).json({
      error: 'DISPATCH_ERROR',
      message: err?.message || 'Error ejecutando despacho de notificaciones.'
    });
  }
}
