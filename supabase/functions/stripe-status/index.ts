import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function probeEnv(env: StripeEnv) {
  try {
    const stripe = createStripeClient(env);
    // Use any cast — the connector's account.retrieve is supported.
    const account: any = await (stripe as any).accounts.retrieve();
    return {
      configured: true,
      ok: true,
      livemode: account?.livemode ?? null,
      account_id: account?.id ?? null,
      country: account?.country ?? null,
      default_currency: account?.default_currency ?? null,
      business_profile_name: account?.business_profile?.name ?? null,
      charges_enabled: account?.charges_enabled ?? null,
      payouts_enabled: account?.payouts_enabled ?? null,
      details_submitted: account?.details_submitted ?? null,
    };
  } catch (e: any) {
    const msg = String(e?.message || e);
    const notConfigured = msg.includes("is not configured");
    return {
      configured: !notConfigured,
      ok: false,
      error: notConfigured ? "Clave no configurada" : msg.slice(0, 200),
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader ?? "");
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    // Admin gate
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const [sandbox, live] = await Promise.all([
      probeEnv("sandbox"),
      probeEnv("live"),
    ]);

    return json({
      sandbox,
      live,
      webhook_secrets: {
        sandbox_configured: !!Deno.env.get("PAYMENTS_SANDBOX_WEBHOOK_SECRET"),
        live_configured: !!Deno.env.get("PAYMENTS_LIVE_WEBHOOK_SECRET"),
      },
      webhook_endpoint: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payments-webhook`,
    });
  } catch (e: any) {
    return json({ error: e?.message || "Unknown error" }, 500);
  }
});
