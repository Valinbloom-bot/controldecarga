import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: userData, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);

    const user = userData.user;
    const email = user.email;
    if (!email) return jsonResponse({ subscribed: false, reason: "no_email" });

    let environment: StripeEnv = "sandbox";
    try {
      const body = await req.json();
      if (body?.environment === "live" || body?.environment === "sandbox") {
        environment = body.environment;
      }
    } catch {
      // no body, use default
    }

    const stripe = createStripeClient(environment);

    // Find a Stripe customer for this email
    const customers = await stripe.customers.list({ email, limit: 10 });
    if (customers.data.length === 0) {
      return jsonResponse({ subscribed: false, reason: "no_customer" });
    }

    // Look across all matching customers for an active/trialing subscription
    let bestSub: any = null;
    let bestCustomerId: string | null = null;
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });
      for (const s of subs.data) {
        if (["active", "trialing", "past_due"].includes(s.status)) {
          if (
            !bestSub ||
            (s.status === "active" && bestSub.status !== "active") ||
            (s.status === "trialing" && bestSub.status === "past_due")
          ) {
            bestSub = s;
            bestCustomerId = customer.id;
          }
        }
      }
    }

    if (!bestSub) {
      return jsonResponse({ subscribed: false, reason: "no_active_sub" });
    }

    const item = bestSub.items?.data?.[0];
    const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.id;
    const productId = item?.price?.product;
    const periodStart = bestSub.current_period_start;
    const periodEnd = bestSub.current_period_end;

    // Sync subscription into our DB so the rest of the app picks it up
    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_subscription_id: bestSub.id,
        stripe_customer_id: bestCustomerId!,
        product_id: productId,
        price_id: priceId,
        status: bestSub.status,
        current_period_start: periodStart
          ? new Date(periodStart * 1000).toISOString()
          : null,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: bestSub.cancel_at_period_end || false,
        environment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );

    return jsonResponse({
      subscribed: ["active", "trialing"].includes(bestSub.status),
      status: bestSub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    });
  } catch (e: any) {
    console.error("check-subscription error:", e);
    return jsonResponse({ error: e?.message || "Internal error" }, 500);
  }
});
