import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useCompAccess() {
  const { user } = useAuth();
  const [hasComp, setHasComp] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchComp = useCallback(async () => {
    if (!user) {
      setHasComp(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc("current_user_has_comp_access");
    setHasComp(!!data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchComp();
  }, [fetchComp]);

  // Re-check when comp_access changes (admin grants/revokes); RLS limits this
  // to admins, but a broadcast channel lets admin pages trigger refreshes too.
  useEffect(() => {
    if (!user) return;
    const handler = () => fetchComp();
    window.addEventListener("comp-access-updated", handler);
    return () => window.removeEventListener("comp-access-updated", handler);
  }, [user, fetchComp]);

  return { hasComp, loading, refetch: fetchComp };
}
