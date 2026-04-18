import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAILED_STATUSES = ["past_due", "unpaid", "incomplete"];

/**
 * Friendly banner shown when the user's last payment failed.
 * Directs them to /cuenta to update their card.
 */
export function PaymentFailedBanner() {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  if (!subscription || !FAILED_STATUSES.includes(subscription.status)) return null;

  const onAccount = location.pathname.startsWith("/cuenta");

  const messages: Record<string, { title: string; body: string }> = {
    past_due: {
      title: "No pudimos cobrar tu tarjeta",
      body: "Tu pago no se procesó. Actualiza tu tarjeta para mantener tu acceso.",
    },
    unpaid: {
      title: "Suscripción suspendida por falta de pago",
      body: "Después de varios intentos no se pudo cobrar. Actualiza tu tarjeta para reactivar.",
    },
    incomplete: {
      title: "Pago incompleto",
      body: "Tu tarjeta fue rechazada. Actualiza tu método de pago para activar tu plan.",
    },
  };

  const msg = messages[subscription.status] ?? messages.past_due;

  return (
    <div className="w-full bg-destructive/10 border-b border-destructive/30 px-4 py-3">
      <div className="flex items-start gap-3 max-w-2xl mx-auto">
        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-destructive">{msg.title}</div>
          <div className="text-xs text-foreground/80 mt-0.5">{msg.body}</div>
          {!onAccount && (
            <Button
              size="sm"
              variant="destructive"
              className="mt-2 h-8"
              onClick={() => navigate("/cuenta")}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Actualizar tarjeta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
