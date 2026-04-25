import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import { getStripe, PAYMENTS_ENV } from "@/lib/stripe";
import PageHeader from "@/components/PageHeader";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Sparkles, ExternalLink, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";
import { getPostLoginPath, isVipEmail } from "@/lib/vip-access";

const PLANS = [
  { priceId: "pro_monthly", name: "Monthly", price: "$4.99", period: "/mo", badge: null as string | null },
  { priceId: "pro_yearly",  name: "Yearly",  price: "$39.99", period: "/yr", badge: "Save 33%" },
];

const FEATURES = [
  "Unlimited loads, fuel, tolls, and expenses",
  "Full weekly and monthly reports",
  "Goals and monthly breakdown",
  "Export to CSV and PDF",
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { isActive, isTrialing, subscription, hasComp, isAdmin, hasFullAccess, loading, refetch } = useAccessStatus();
  const isVip = isVipEmail(user?.email);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busyPriceId, setBusyPriceId] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const justSucceeded = params.get("success") === "1";

  useEffect(() => {
    if (justSucceeded) {
      toast.success("Subscription started! Your 7-day trial is active.");
      const t = setInterval(refetch, 1500);
      const stop = setTimeout(() => clearInterval(t), 12000);
      params.delete("success");
      setParams(params, { replace: true });
      return () => { clearInterval(t); clearTimeout(stop); };
    }
  }, [justSucceeded, params, setParams, refetch]);

  useEffect(() => {
    if (isVip) { navigate(getPostLoginPath(user?.email), { replace: true }); return; }
    if (loading || clientSecret || justSucceeded) return;
    if (hasFullAccess) navigate("/", { replace: true });
  }, [hasFullAccess, loading, clientSecret, justSucceeded, navigate, isVip, user?.email]);

  if (isVip) return <Navigate to={getPostLoginPath(user?.email)} replace />;

  const handleSubscribe = async (priceId: string) => {
    if (!user) { navigate("/auth"); return; }
    setBusyPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId, returnUrl: `${window.location.origin}/precios?success=1`, environment: PAYMENTS_ENV },
      });
      if (error) throw error;
      if (!data?.clientSecret) throw new Error("No client secret returned");
      setClientSecret(data.clientSecret);
    } catch (e: any) {
      const raw = (e?.message || "").toLowerCase();
      let friendly = "We couldn't start the payment. Please try again in a moment.";
      if (raw.includes("declin") || raw.includes("card")) friendly = "Your card was declined. Check the details or try another card.";
      else if (raw.includes("network") || raw.includes("fetch")) friendly = "Connection problem. Check your internet and try again.";
      toast.error(friendly);
    } finally {
      setBusyPriceId(null);
    }
  };

  const handleManage = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/precios`, environment: PAYMENTS_ENV },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e?.message || "Could not open portal");
    } finally {
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (hasFullAccess && !clientSecret && !justSucceeded) return <Navigate to="/" replace />;

  if (clientSecret) {
    return (
      <div className="pb-20">
        <PaymentTestModeBanner />
        <PageHeader title="Payment" />
        <div className="px-4">
          <div className="mb-3 flex items-center justify-end">
            <Button size="sm" variant="ghost" onClick={() => setClientSecret(null)}>Cancel</Button>
          </div>
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PaymentTestModeBanner />
      <PageHeader title="Pro Plan" />
      <div className="px-4 space-y-4">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 7 days free
          </div>
          <h2 className="text-2xl font-bold">Take full control</h2>
          <p className="text-sm text-muted-foreground mt-1">Cancel anytime during the trial.</p>
        </div>

        {isAdmin && (
          <Card className="p-4 border-primary/40 bg-primary/5">
            <div className="flex items-start gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary mt-0.5" />
              <div className="font-semibold text-sm">Admin access active</div>
            </div>
            <div className="text-xs text-muted-foreground pl-6">Your account has unrestricted access and doesn't need a subscription.</div>
          </Card>
        )}

        {!isAdmin && hasComp && (
          <Card className="p-4 border-primary/40 bg-primary/5">
            <div className="flex items-start gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
              <div className="font-semibold text-sm">Free access active</div>
            </div>
            <div className="text-xs text-muted-foreground pl-6">Your account has access enabled with no charges or payment block.</div>
          </Card>
        )}

        {isActive && subscription && (
          <Card className="p-4 border-primary/40 bg-primary/5">
            <div className="flex items-start gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
              <div className="font-semibold text-sm">{isTrialing ? "Trial period active" : "Subscription active"}</div>
            </div>
            <div className="text-xs text-muted-foreground mb-3 pl-6">
              Plan: {subscription.price_id === "pro_yearly" ? "Yearly" : "Monthly"}
              {subscription.current_period_end && (
                <> · {isTrialing ? "First charge" : "Renews"} on {new Date(subscription.current_period_end).toLocaleDateString("en-US")}</>
              )}
              {subscription.cancel_at_period_end && <> · Cancellation scheduled</>}
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={handleManage} disabled={openingPortal}>
              {openingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage subscription
            </Button>
          </Card>
        )}

        <Card className="p-4">
          <ul className="space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3">
          {PLANS.map((plan) => (
            <Card key={plan.priceId} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{plan.badge}</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={loading || busyPriceId !== null || hasFullAccess}
                onClick={() => handleSubscribe(plan.priceId)}
              >
                {busyPriceId === plan.priceId && <Loader2 className="w-4 h-4 animate-spin" />}
                {hasFullAccess ? "Access active" : "Start 7-day trial"}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-[11px] text-center text-muted-foreground px-4">
          No charges during the trial. After 7 days you'll be charged automatically for the chosen plan. You can cancel anytime.
        </p>
      </div>
    </div>
  );
}
