import { Link } from "react-router-dom";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsageGate, type Resource, FREE_TIER_LIMIT } from "@/hooks/useUsageGate";

interface Props {
  resource: Resource;
}

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
            <div className="font-semibold text-sm">You hit the free limit</div>
            <div className="text-xs text-muted-foreground">
              You already saved {FREE_TIER_LIMIT} {label.plural}. Subscribe to log unlimited entries.
            </div>
          </div>
        </div>
        <Button asChild size="sm" className="w-full mt-3">
          <Link to="/precios">
            <Sparkles className="w-4 h-4" /> Start 7-day free trial
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 rounded-lg border border-border bg-muted/40 px-3 py-2 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">
        Free plan: {count} of {FREE_TIER_LIMIT} {label.plural}. <strong className="text-foreground">{remaining}</strong> left.
      </span>
      <Link to="/precios" className="font-semibold text-primary shrink-0 ml-3">
        Upgrade
      </Link>
    </div>
  );
}
