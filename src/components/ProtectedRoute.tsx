import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCompAccess } from "@/hooks/useCompAccess";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

// Routes a logged-in user without an active subscription/trial may still visit
const SUB_EXEMPT_ROUTES = ["/precios", "/configuracion", "/cuenta", "/admin"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isActive, loading: loadingSub } = useSubscription();
  const { hasComp, loading: loadingComp } = useCompAccess();
  const { isAdmin, loading: loadingRole } = useUserRole();
  const location = useLocation();

  if (loading || (user && (loadingSub || loadingComp || loadingRole))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Hard paywall: must have active subscription, trial, comp access, or admin
  const isExempt = SUB_EXEMPT_ROUTES.some((p) => location.pathname.startsWith(p));
  if (!isActive && !hasComp && !isAdmin && !isExempt) {
    return <Navigate to="/precios" replace />;
  }

  return <>{children}</>;
}
