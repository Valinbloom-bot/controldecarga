import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string);

const PLANS = [
  {
    priceId: "pro_monthly",
    name: "Mensual",
    price: "$4.99",
    period: "/mes",
    badge: null as string | null,
  },
  {
    priceId: "pro_yearly",
    name: "Anual",
    price: "$39.99",
    period: "/año",
    badge: "Ahorra 33%",
  },
];

const FEATURES = [
  "Registro ilimitado de cargas",
  "Control de gasolina y peajes",
  "Gastos del vehículo",
  "Reportes semanales y mensuales",
  "Metas y desglose por mes",
  "Exportar a CSV y PDF",
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isActive, subscription, loading: loadingSub } = useSubscription();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busyPriceId, setBusyPriceId] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    return () => setClientSecret(null);
  }, []);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setBusyPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId,
          returnUrl: `${window.location.origin}/precios?success=1`,
          environment: "sandbox",
        },
      });
      if (error) throw error;
      if (!data?.clientSecret) throw new Error("No client secret returned");
      setClientSecret(data.clientSecret);
    } catch (e: any) {
      toast.error(e?.message || "No se pudo iniciar el pago");
    } finally {
      setBusyPriceId(null);
    }
  };

  const handleManage = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/precios`,
          environment: "sandbox",
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e?.message || "No se pudo abrir el portal");
    } finally {
      setOpeningPortal(false);
    }
  };

  if (clientSecret) {
    return (
      <div className="pb-20">
        <PageHeader title="Pago" />
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Modo de prueba — usa la tarjeta 4242 4242 4242 4242</p>
            <Button size="sm" variant="ghost" onClick={() => setClientSecret(null)}>
              Cancelar
            </Button>
          </div>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader title="Plan Pro" />
      <div className="px-4 space-y-4">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 7 días gratis
          </div>
          <h2 className="text-2xl font-bold">Lleva el control completo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cancela cuando quieras durante la prueba.
          </p>
        </div>

        {isActive && subscription && (
          <Card className="p-4 border-primary/40 bg-primary/5">
            <div className="font-semibold text-sm mb-1">
              {subscription.status === "trialing" ? "En período de prueba" : "Suscripción activa"}
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Plan: {subscription.price_id === "pro_yearly" ? "Anual" : "Mensual"}
              {subscription.current_period_end && (
                <> · Renueva el {new Date(subscription.current_period_end).toLocaleDateString("es-ES")}</>
              )}
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={handleManage} disabled={openingPortal}>
              {openingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Gestionar suscripción
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        {plan.badge}
                      </span>
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
                disabled={loadingSub || busyPriceId !== null || isActive}
                onClick={() => handleSubscribe(plan.priceId)}
              >
                {busyPriceId === plan.priceId && <Loader2 className="w-4 h-4 animate-spin" />}
                {isActive ? "Plan activo" : "Empezar prueba de 7 días"}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-[11px] text-center text-muted-foreground px-4">
          No se cobra durante la prueba. Después de 7 días se cobra automáticamente el plan elegido. Puedes cancelar en cualquier momento.
        </p>
      </div>
    </div>
  );
}
