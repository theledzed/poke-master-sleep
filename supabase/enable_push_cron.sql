-- ============================================================================
-- Pokémon Sleep Master — Reloj Automático 24/7 de Notificaciones Push (Gratis)
-- Ejecuta este script 1 sola vez en el SQL Editor de tu proyecto Supabase.
-- Nota: Puedes copiar este mismo bloque con tu URL exacta desde la campana 🔔 de la app.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'pokesleep-push-dispatch',
  '*/5 * * * *',
  $$ select net.http_get(url := 'https://poke-master-sleep.vercel.app/api/push') $$
);
