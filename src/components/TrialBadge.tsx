import { Sparkles, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccessStatus } from "@/hooks/useAccessStatus";

/**
 * - Trial nativo activo: muestra días restantes
 * - Sin acceso: muestra chip de upgrade
 * - Suscripción activa / comp / admin: nada
 */
export default function TrialBadge() {
  const { accessMode, trialDaysLeft, isActive, loading } = useAccessStatus();
  if (loading) return null;

  if (accessMode === "trial") {
    return (
      <Link
        to="/precios"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold"
      >
        <Clock className="w-3 h-3" />
        {trialDaysLeft === 0
          ? "Prueba termina hoy"
          : `${trialDaysLeft} día${trialDaysLeft === 1 ? "" : "s"} de prueba`}
      </Link>
    );
  }

  if (!isActive) {
    return (
      <Link
        to="/precios"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold"
      >
        <Sparkles className="w-3 h-3" /> Elegir plan
      </Link>
    );
  }

  return null;
}
