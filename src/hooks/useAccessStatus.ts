import { useMemo } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useCompAccess } from "@/hooks/useCompAccess";
import { useUserRole } from "@/hooks/useUserRole";

export type AccessMode = "subscription" | "comp" | "admin" | "none";

export function useAccessStatus() {
  const {
    subscription,
    isActive,
    isTrialing,
    loading: loadingSubscription,
    refetch,
  } = useSubscription();
  const { hasComp, loading: loadingComp } = useCompAccess();
  const { isAdmin, loading: loadingRole } = useUserRole();

  const loading = loadingSubscription || loadingComp || loadingRole;

  const accessMode = useMemo<AccessMode>(() => {
    if (isAdmin) return "admin";
    if (hasComp) return "comp";
    if (isActive) return "subscription";
    return "none";
  }, [isAdmin, hasComp, isActive]);

  return {
    subscription,
    isActive,
    isTrialing,
    hasComp,
    isAdmin,
    hasFullAccess: accessMode !== "none",
    accessMode,
    loading,
    refetch,
  };
}
