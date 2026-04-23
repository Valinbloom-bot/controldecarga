import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccessStatus } from "@/hooks/useAccessStatus";
import { Loader2 } from "lucide-react";
import { getPostLoginPath, isVipEmail } from "@/lib/vip-access";

// Routes a logged-in user without an active subscription/trial may still visit
const SUB_EXEMPT_ROUTES = ["/precios", "/configuracion", "/cuenta", "/admin"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: loadingAuth } = useAuth();
  const { hasFullAccess, loading: loadingAccess } = useAccessStatus();
  const location = useLocation();
  const isVip = isVipEmail(user?.email);

  if (loadingAuth || (user && loadingAccess && !isVip)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (isVip && location.pathname.startsWith("/precios")) {
    return <Navigate to={getPostLoginPath(user.email)} replace />;
  }

  if (hasFullAccess && location.pathname.startsWith("/precios")) {
    return <Navigate to="/" replace />;
  }

  const isExempt = SUB_EXEMPT_ROUTES.some((p) => location.pathname.startsWith(p));
  if (!hasFullAccess && !isExempt) {
    return <Navigate to="/precios" replace />;
  }

  return <>{children}</>;
}
