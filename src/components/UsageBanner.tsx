import { Link } from "react-router-dom";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsageGate, type Resource, FREE_TIER_LIMIT } from "@/hooks/useUsageGate";

interface Props {
  resource: Resource;
}

/**
 * Banner that shows above the list:
 * - Free user under limit: "X de 5 gratis usados"
 * - Free user at limit: locked + upgrade CTA
 * - Pro/trial: nothing
 */
export default function UsageBanner({ resource }: Props) {
  const { isActive, count, remaining, blocked, label, loading } = useUsageGate(resource);

  if (loading || isActive) return null;

  if (blocked) {
    return (
      <div className="mx-4 mb-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 rounded-md bg-primary/15 text-primary flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Llegaste al límite gratis</div>
            <div className="text-xs text-muted-foreground">
              Ya guardaste {FREE_TIER_LIMIT} {label.plural}. Suscríbete para registrar sin límite.
            </div>
          </div>
        </div>
        <Button asChild size="sm" className="w-full mt-3">
          <Link to="/precios">
            <Sparkles className="w-4 h-4" /> Empezar prueba de 7 días
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 rounded-lg border border-border bg-muted/40 px-3 py-2 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">
        Plan gratis: {count} de {FREE_TIER_LIMIT} {label.plural}. Quedan <strong className="text-foreground">{remaining}</strong>.
      </span>
      <Link to="/precios" className="font-semibold text-primary shrink-0 ml-3">
        Mejorar
      </Link>
    </div>
  );
}
