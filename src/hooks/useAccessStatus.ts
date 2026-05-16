import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCompAccess } from "@/hooks/useCompAccess";
import { useUserRole } from "@/hooks/useUserRole";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { isVipEmail } from "@/lib/vip-access";

export type AccessMode = "subscription" | "trial" | "comp" | "admin" | "none";

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
  const { trialActive, trialDaysLeft, trialEndsAt } = useTrialStatus();

  const isVip = isVipEmail(user?.email);

  const loading = isVip ? false : (loadingSubscription || loadingComp || loadingRole);

  const accessMode = useMemo<AccessMode>(() => {
    if (isVip) return "admin";
    if (isAdmin) return "admin";
    if (hasComp) return "comp";
    if (isActive) return "subscription";
    if (trialActive) return "trial";
    return "none";
  }, [isVip, isAdmin, hasComp, isActive, trialActive]);

  return {
    subscription,
    isActive: isVip || isActive,
    isTrialing,
    hasComp,
    isAdmin: isVip || isAdmin,
    trialActive,
    trialDaysLeft,
    trialEndsAt,
    hasFullAccess: accessMode !== "none",
    accessMode,
    loading,
    refetch,
  };
}
