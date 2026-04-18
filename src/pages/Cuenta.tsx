import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PAYMENTS_ENV } from "@/lib/stripe";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Calendar,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowUpDown,
  XCircle,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const PLAN_LABEL: Record<string, { name: string; price: string; period: string }> = {
  pro_monthly: { name: "Mensual", price: "$4.99", period: "/mes" },
  pro_yearly: { name: "Anual", price: "$39.99", period: "/año" },
};

export default function Cuenta() {
  const navigate = useNavigate();
  const { user, displayName, signOut } = useAuth();
  const { subscription, isActive, isTrialing, loading } = useSubscription();
  const [opening, setOpening] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const openPortal = async (action: "manage" | "card" | "cancel" | "switch") => {
    setOpening(action);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/cuenta`, environment: PAYMENTS_ENV },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No se pudo abrir el portal");
    } catch (e: any) {
      toast.error(e?.message || "No se pudo abrir el portal");
    } finally {
      setOpening(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const planInfo = subscription?.price_id ? PLAN_LABEL[subscription.price_id] : null;
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const paymentFailed = subscription
    ? ["past_due", "unpaid", "incomplete"].includes(subscription.status)
    : false;

  return (
    <div className="pb-20">
      <PageHeader title="Mi cuenta" />
      <div className="px-4 space-y-4">
        {/* User info */}
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Sesión iniciada como</div>
          <div className="font-semibold text-sm mt-0.5 truncate">
            {displayName || user?.email}
          </div>
          {displayName && user?.email && (
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          )}
        </Card>

        {/* Subscription status */}
        {loading ? (
          <Card className="p-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </Card>
        ) : paymentFailed && subscription ? (
          <>
            <Card className="p-4 border-destructive/40 bg-destructive/5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-destructive">
                    {subscription.status === "unpaid"
                      ? "Suscripción suspendida"
                      : "No pudimos cobrar tu tarjeta"}
                  </div>
                  <div className="text-xs text-foreground/80 mt-1">
                    {subscription.status === "unpaid"
                      ? "Después de varios intentos no se pudo procesar el cobro. Actualiza tu tarjeta para reactivar tu acceso."
                      : subscription.status === "incomplete"
                      ? "Tu tarjeta fue rechazada al iniciar la suscripción. Actualiza tu método de pago para activar tu plan."
                      : "Tu último pago fue rechazado. Actualiza tu tarjeta para mantener tu acceso a la app."}
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => openPortal("card")}
                    disabled={opening !== null}
                  >
                    {opening === "card" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Actualizar tarjeta
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : isActive && subscription ? (
          <>
            <Card className="p-4 border-primary/40 bg-primary/5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">
                    {isTrialing ? "Período de prueba activo" : "Plan Pro activo"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {planInfo
                      ? `${planInfo.name} · ${planInfo.price}${planInfo.period}`
                      : "Plan Pro"}
                  </div>
                  {subscription.cancel_at_period_end && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>Cancelación programada al fin del período.</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Next billing */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {isTrialing ? "Primer cobro" : subscription.cancel_at_period_end ? "Acceso hasta" : "Próxima renovación"}
                  </div>
                  <div className="font-semibold text-sm">
                    {periodEnd
                      ? periodEnd.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </div>
                </div>
              </div>
            </Card>

            {/* Management actions */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold px-1">Gestionar suscripción</h2>

              <Card className="p-3">
                <button
                  onClick={() => openPortal("switch")}
                  disabled={opening !== null}
                  className="w-full flex items-center gap-3 text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ArrowUpDown className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Cambiar plan</div>
                    <div className="text-xs text-muted-foreground">
                      Cambia entre Mensual y Anual
                    </div>
                  </div>
                  {opening === "switch" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </Card>

              <Card className="p-3">
                <button
                  onClick={() => openPortal("card")}
                  disabled={opening !== null}
                  className="w-full flex items-center gap-3 text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Tarjeta de crédito</div>
                    <div className="text-xs text-muted-foreground">
                      Actualizar método de pago
                    </div>
                  </div>
                  {opening === "card" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </Card>

              <Card className="p-3">
                <button
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={opening !== null}
                  className="w-full flex items-center gap-3 text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Cancelar suscripción</div>
                    <div className="text-xs text-muted-foreground">
                      Mantienes acceso hasta el fin del período
                    </div>
                  </div>
                  {opening === "cancel" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </Card>
            </div>

            <p className="text-[11px] text-center text-muted-foreground px-4">
              Las acciones de suscripción se gestionan en el portal seguro de pagos. Se abre en una nueva pestaña.
            </p>
          </>
        ) : (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Sin suscripción activa</div>
                <div className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Empieza tu prueba de 7 días gratis para acceder a la app.
                </div>
                <Button size="sm" className="w-full" onClick={() => navigate("/precios")}>
                  Ver planes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Sign out */}
        <Card className="p-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="w-9 h-9 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Cerrar sesión</div>
            </div>
          </button>
        </Card>
      </div>

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se abrirá el portal seguro de pagos en una nueva pestaña para confirmar la cancelación.
              Mantendrás acceso a la app hasta el fin del período actual
              {periodEnd ? ` (${periodEnd.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })})` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmCancelOpen(false);
                openPortal("cancel");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continuar al portal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
