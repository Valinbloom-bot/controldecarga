# Trial de 7 días sin tarjeta + recordatorios + bloqueo automático

## 1. Trial sin tarjeta (acceso por tiempo)

Hoy el trial vive en Stripe y exige tarjeta. Cambiamos a un trial nativo basado en la fecha de registro.

- El trial empieza con el signup. Usamos `auth.users.created_at` como `trial_started_at` (sin nueva tabla; ya existe).
- Definimos `trial_ends_at = created_at + 7 days`.
- Nuevo hook `useTrialStatus` que devuelve `{ trialActive, trialDaysLeft, trialEndsAt }`.
- En `useAccessStatus`:
  - `hasFullAccess = isAdmin || hasComp || isActive (subscription) || trialActive`.
  - Nuevo `accessMode: "trial"`.
- `ProtectedRoute` sigue redirigiendo a `/precios` cuando no hay acceso → al expirar el día 7 cae automáticamente al paywall.
- `TrialBadge` deja de depender de Stripe `trialing` y muestra los días restantes del trial nativo.

## 2. Página de precios y checkout (sin trial en Stripe)

- `/precios` muestra solo los dos planes: **Pro Mensual $4.99/mes** y **Pro Anual $39.99/año**.
- Copy actualizado: durante los primeros 7 días no se pide tarjeta; al expirar, hay que elegir plan.
- Edge function `create-checkout-session`: quitar `trial_period_days` para que el cobro sea inmediato (el trial ya se consumió antes).
- Botón pasa de "Empezar prueba de 7 días" a "Suscribirme" / "Elegir plan".

## 3. Recordatorios por email (día 4 y día 5)

Requiere infraestructura de emails de Lovable Cloud. Pasos:

- Si aún no hay dominio configurado, pedirte que lo configures (botón de setup).
- Una vez listo, montamos infra de emails y una edge function programada `trial-reminder-cron` que cada día:
  - Busca usuarios cuyo `created_at` corresponda al día 4 (3 días restantes) o día 5 (2 días restantes) del trial.
  - Excluye admins, comp access y usuarios con suscripción activa.
  - Encola email transaccional (plantilla `trial-reminder`) con CTA a `/precios`.
- Idempotencia: tabla `trial_reminders_sent (user_id, day)` para no duplicar envíos.
- Cron de Postgres: ejecución diaria (ej. 14:00 UTC).

## 4. Bloqueo automático día 7

- No requiere job extra: al pasar `trial_ends_at`, `useTrialStatus` devuelve `trialActive=false` y `ProtectedRoute` redirige a `/precios`.
- El frontend re-evalúa el trial en cada carga, así no hace falta sesión activa para echar al usuario.

## Cambios técnicos puntuales

```text
src/hooks/useTrialStatus.ts        (NUEVO)
src/hooks/useAccessStatus.ts       (incluir trial)
src/hooks/useSubscription.ts       (sin cambios funcionales)
src/components/TrialBadge.tsx      (usar useTrialStatus)
src/pages/Pricing.tsx              (copy + sin "prueba 7 días" en botón)
supabase/functions/create-checkout-session/index.ts  (quitar trial)
supabase/functions/trial-reminder-cron/index.ts      (NUEVO)
migración: tabla trial_reminders_sent + cron job diario
```

## Lo que necesito de tu lado

1. Confirmar el plan.
2. Para los emails: si todavía no tienes dominio de email configurado en Lovable Cloud, te pediré configurarlo (paso de un clic). Sin dominio, el bloqueo y los planes funcionan, pero los recordatorios no se envían.
