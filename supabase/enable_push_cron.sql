-- ============================================================================
-- Pokémon Sleep Master — Reloj Automático 24/7 de Notificaciones Push (Gratis)
-- Ejecuta este script 1 sola vez en el SQL Editor de tu proyecto Supabase.
-- Nota: Puedes copiar este mismo bloque con tu URL exacta desde la campana 🔔 de la app.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Desprogramar trabajo previo si existía con URL vieja
do $$
begin
  if exists (select 1 from cron.job where jobname = 'pokesleep-push-dispatch') then
    perform cron.unschedule('pokesleep-push-dispatch');
  end if;
end $$;

-- Programar despacho automático cada 5 minutos hacia la URL activa en producción
select cron.schedule(
  'pokesleep-push-dispatch',
  '*/5 * * * *',
  $$ select net.http_get(url := 'https://hachidori-airlines-fap8.vercel.app/api/push') $$
);
