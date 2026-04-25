import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import { PAYMENTS_ENV } from "@/lib/stripe";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CreditCard, Calendar, ExternalLink, Loader2, Sparkles, ArrowUpDown,
  XCircle, LogOut, CheckCircle2, AlertCircle, Shield, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const PLAN_LABEL: Record<string, { name: string; price: string; period: string }> = {
  pro_monthly: { name: "Monthly", price: "$4.99", period: "/mo" },
  pro_yearly: { name: "Yearly", price: "$39.99", period: "/yr" },
};

export default function Cuenta() {
  const navigate = useNavigate();
  const { user, displayName, signOut } = useAuth();
  const { subscription, isActive, isTrialing, hasComp, isAdmin, hasFullAccess, accessMode, loading } = useAccessStatus();
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
      else throw new Error("Could not open portal");
    } catch (e: any) {
      toast.error(e?.message || "Could not open portal");
    } finally {
      setOpening(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const planInfo = subscription?.price_id ? PLAN_LABEL[subscription.price_id] : null;
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const paymentFailed = subscription ? ["past_due", "unpaid", "incomplete"].includes(subscription.status) : false;

  return (
    <div className="pb-20">
      <PageHeader title="My account" />
      <div className="px-4 space-y-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="font-semibold text-sm mt-0.5 truncate">{displayName || user?.email}</div>
          {displayName && user?.email && (<div className="text-xs text-muted-foreground truncate">{user.email}</div>)}
        </Card>

        {isAdmin && (
          <Link to="/admin" className="block">
            <Card className="p-4 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Shield className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">Admin panel</div>
                  <div className="text-xs text-muted-foreground">Manage free access and users</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        )}

        {loading ? (
          <Card className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></Card>
        ) : paymentFailed && subscription ? (
          <Card className="p-4 border-destructive/40 bg-destructive/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-destructive">
                  {subscription.status === "unpaid" ? "Subscription suspended" : "We couldn't charge your card"}
                </div>
                <div className="text-xs text-foreground/80 mt-1">
                  {subscription.status === "unpaid"
                    ? "After several attempts the charge failed. Update your card to reactivate access."
                    : subscription.status === "incomplete"
                    ? "Your card was declined when starting the subscription. Update your payment method to activate your plan."
                    : "Your last payment was declined. Update your card to keep access."}
                </div>
                <Button size="sm" className="mt-3 w-full" onClick={() => openPortal("card")} disabled={opening !== null}>
                  {opening === "card" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Update card
                </Button>
              </div>
            </div>
          </Card>
        ) : accessMode === "subscription" && isActive && subscription ? (
          <>
            <Card className="p-4 border-primary/40 bg-primary/5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{isTrialing ? "Trial period active" : "Pro plan active"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {planInfo ? `${planInfo.name} · ${planInfo.price}${planInfo.period}` : "Pro plan"}
                  </div>
                  {subscription.cancel_at_period_end && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>Cancellation scheduled at end of period.</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Calendar className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {isTrialing ? "First charge" : subscription.cancel_at_period_end ? "Access until" : "Next renewal"}
                  </div>
                  <div className="font-semibold text-sm">
                    {periodEnd ? periodEnd.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold px-1">Manage subscription</h2>

              <Card className="p-3">
                <button onClick={() => openPortal("switch")} disabled={opening !== null} className="w-full flex items-center gap-3 text-left disabled:opacity-50">
                  <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><ArrowUpDown className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Change plan</div>
                    <div className="text-xs text-muted-foreground">Switch between Monthly and Yearly</div>
                  </div>
                  {opening === "switch" ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                </button>
              </Card>

              <Card className="p-3">
                <button onClick={() => openPortal("card")} disabled={opening !== null} className="w-full flex items-center gap-3 text-left disabled:opacity-50">
                  <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Credit card</div>
                    <div className="text-xs text-muted-foreground">Update payment method</div>
                  </div>
                  {opening === "card" ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                </button>
              </Card>

              <Card className="p-3">
                <button onClick={() => setConfirmCancelOpen(true)} disabled={opening !== null} className="w-full flex items-center gap-3 text-left disabled:opacity-50">
                  <div className="w-9 h-9 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0"><XCircle className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Cancel subscription</div>
                    <div className="text-xs text-muted-foreground">You keep access until end of period</div>
                  </div>
                  {opening === "cancel" ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                </button>
              </Card>
            </div>

            <p className="text-[11px] text-center text-muted-foreground px-4">
              Subscription actions are managed in the secure payments portal. It opens in a new tab.
            </p>
          </>
        ) : hasComp ? (
          <Card className="p-4 border-primary/40 bg-primary/5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Free access active</div>
                <div className="text-xs text-muted-foreground mt-0.5">Your account has permanent access with no charges or subscription block.</div>
              </div>
            </div>
          </Card>
        ) : isAdmin ? (
          <Card className="p-4 border-primary/40 bg-primary/5">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Admin active</div>
                <div className="text-xs text-muted-foreground mt-0.5">Your account has unrestricted access and can manage other users.</div>
              </div>
            </div>
          </Card>
        ) : !hasFullAccess ? (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">No active subscription</div>
                <div className="text-xs text-muted-foreground mt-0.5 mb-3">Start your free 7-day trial to use the app.</div>
                <Button size="sm" className="w-full" onClick={() => navigate("/precios")}>View plans</Button>
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="p-3">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0"><LogOut className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0"><div className="font-semibold text-sm">Sign out</div></div>
          </button>
        </Card>
      </div>

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              The secure payments portal will open in a new tab to confirm the cancellation.
              You'll keep access until the end of the current period
              {periodEnd ? ` (${periodEnd.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })})` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmCancelOpen(false); openPortal("cancel"); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue to portal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
