import { Sparkles, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccessStatus } from "@/hooks/useAccessStatus";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * - Trialing: shows "X días de prueba"
 * - Free (no access): shows upgrade chip
 * - Active paid/comp/admin: nothing
 */
export default function TrialBadge() {
  const { subscription, isActive, isTrialing, accessMode, loading } = useAccessStatus();
  if (loading) return null;

  if (accessMode === "subscription" && isTrialing && subscription?.current_period_end) {
    const days = daysUntil(subscription.current_period_end);
    if (days === null) return null;
    return (
      <Link
        to="/precios"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold"
      >
        <Clock className="w-3 h-3" />
        {days === 0 ? "Prueba termina hoy" : `${days} día${days === 1 ? "" : "s"} de prueba`}
      </Link>
    );
  }

  if (!isActive) {
    return (
      <Link
        to="/precios"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold"
      >
        <Sparkles className="w-3 h-3" /> Prueba gratis
      </Link>
    );
  }

  return null;
}
