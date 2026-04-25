import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isVipEmail } from "@/lib/vip-access";

const FAILED_STATUSES = ["past_due", "unpaid", "incomplete"];

export function PaymentFailedBanner() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  if (isVipEmail(user?.email)) return null;
  if (!subscription || !FAILED_STATUSES.includes(subscription.status)) return null;

  const onAccount = location.pathname.startsWith("/cuenta");

  const messages: Record<string, { title: string; body: string }> = {
    past_due: {
      title: "We couldn't charge your card",
      body: "Your payment didn't go through. Update your card to keep your access.",
    },
    unpaid: {
      title: "Subscription suspended for non-payment",
      body: "After several attempts the charge failed. Update your card to reactivate.",
    },
    incomplete: {
      title: "Incomplete payment",
      body: "Your card was declined. Update your payment method to activate your plan.",
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
              Update card
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
