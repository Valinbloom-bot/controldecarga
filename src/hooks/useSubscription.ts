import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PAYMENTS_ENV } from "@/lib/stripe";

export interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string | null;
  product_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  environment: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);

  const computeIsActive = (sub: SubscriptionRow | null) => {
    if (!sub) return false;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
    const notExpired = !periodEnd || periodEnd > new Date();
    return ["active", "trialing"].includes(sub.status) && notExpired;
  };

  const fetchSub = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("id,status,price_id,product_id,current_period_end,cancel_at_period_end,environment")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const row = (data as SubscriptionRow | null) ?? null;
    setSubscription(row);

    // If no active local subscription, sync from Stripe once per session
    // to catch subs created directly in Stripe (no metadata.userId on webhook).
    if (!computeIsActive(row) && syncedRef.current !== user.id) {
      syncedRef.current = user.id;
      try {
        const { data: synced } = await supabase.functions.invoke("check-subscription", {
          body: { environment: PAYMENTS_ENV },
        });
        if (synced?.subscribed) {
          // Re-read the freshly upserted row
          const { data: refreshed } = await supabase
            .from("subscriptions")
            .select("id,status,price_id,product_id,current_period_end,cancel_at_period_end,environment")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          setSubscription((refreshed as SubscriptionRow | null) ?? null);
        }
      } catch (e) {
        console.error("check-subscription failed:", e);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSub();
  }, [fetchSub]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subscriptions-changes-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => fetchSub(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSub]);

  const isActive = computeIsActive(subscription);
  const isTrialing = subscription?.status === "trialing";

  return { subscription, isActive, isTrialing, loading, refetch: fetchSub };
}
