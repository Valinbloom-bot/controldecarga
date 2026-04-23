import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCompAccess } from "@/hooks/useCompAccess";
import { useUserRole } from "@/hooks/useUserRole";

export type AccessMode = "subscription" | "comp" | "admin" | "none";

// These emails ALWAYS get full access — no async checks needed.
const VIP_EMAILS = [
  "medusashookah@gmail.com",
  "ojose122687@gmail.com",
];

export function useAccessStatus() {
  const { user } = useAuth();
  const {
    subscription,
    isActive,
    isTrialing,
    loading: loadingSubscription,
    refetch,
  } = useSubscription();
  const { hasComp, loading: loadingComp } = useCompAccess();
  const { isAdmin, loading: loadingRole } = useUserRole();

  const isVip = !!user?.email && VIP_EMAILS.includes(user.email.toLowerCase());

  const loading = isVip ? false : (loadingSubscription || loadingComp || loadingRole);

  const accessMode = useMemo<AccessMode>(() => {
    if (isVip) return "admin";
    if (isAdmin) return "admin";
    if (hasComp) return "comp";
    if (isActive) return "subscription";
    return "none";
  }, [isVip, isAdmin, hasComp, isActive]);

  return {
    subscription,
    isActive: isVip || isActive,
    isTrialing,
    hasComp,
    isAdmin: isVip || isAdmin,
    hasFullAccess: accessMode !== "none",
    accessMode,
    loading,
    refetch,
  };
}
