import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

export const TRIAL_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Native time-based trial: starts at signup (auth.users.created_at)
 * and lasts TRIAL_DAYS calendar days. No credit card required.
 */
export function useTrialStatus() {
  const { user, loading } = useAuth();

  return useMemo(() => {
    if (loading || !user?.created_at) {
      return { trialActive: false, trialDaysLeft: 0, trialEndsAt: null as Date | null };
    }
    const start = new Date(user.created_at).getTime();
    const end = start + TRIAL_DAYS * MS_PER_DAY;
    const now = Date.now();
    const daysLeft = Math.max(0, Math.ceil((end - now) / MS_PER_DAY));
    return {
      trialActive: now < end,
      trialDaysLeft: daysLeft,
      trialEndsAt: new Date(end),
    };
  }, [user?.created_at, loading]);
}
